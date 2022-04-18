import { App, WebSocket, WebSocketBehavior } from "uWebSockets.js";
import Client from "./client";
import ProjectRepository from "./project-repository";
import { MessageMap } from "./types";
import SubscriberManager from "./utils/subscriber/SubscriberManager";

const textDecoder = new TextDecoder();

export default class WebSocketServer extends SubscriberManager {
	constructor(port: number, callback: () => void) {
		super();

		App().ws("/*", this.getBehavior()).listen(port, callback);

		this.setupListeners();
	}

	private getBehavior(): WebSocketBehavior {
		return {
			message: (socket, messageData) => {
				const messageStr = textDecoder.decode(messageData);
				const messageObj = JSON.parse(messageStr);
				const { type, data } = messageObj;

				this.invokeSubscribers(type, {
					socket,
					data,
					message: messageStr,
				});
			},
			close: (socket) => {
				this.invokeSubscribers("close", { socket });
			},
		};
	}

	private setupListeners() {
		this.subscribe(
			"REGISTER_CLIENT",
			({
				socket,
				data,
			}: {
				socket: WebSocket;
				data: MessageMap["REGISTER_CLIENT"]["data"];
			}) => {
				if (socket.client !== undefined) return;

				const { projectId } = data;
				const project = ProjectRepository.createIfAbsent(projectId);
				const client = new Client(socket, project);

				project.addClient(client);

				socket.client = client;
			}
		);

		this.subscribe(
			"UNREGISTER_CLIENT",
			({
				socket,
				data,
			}: {
				socket: WebSocket;
				data: MessageMap["UNREGISTER_CLIENT"]["data"];
			}) => this.unregisterClient(socket, data)
		);

		this.subscribe(
			"PUBLISH",
			({
				socket,
				data,
				message,
			}: {
				socket: WebSocket;
				data: MessageMap["PUBLISH"]["data"];
				message: string;
			}) => {
				if (socket.client === undefined) return;

				const { topic } = data;
				const client = socket.client;
				const project = client.getProject();
				const topicClients = project.getTopicClients(topic);

				for (const topicClient of topicClients) {
					if (topicClient === client) continue;

					topicClient.send(message);
				}
			}
		);

		this.subscribe(
			"SUBSCRIBE",
			({
				socket,
				data,
			}: {
				socket: WebSocket;
				data: MessageMap["SUBSCRIBE"]["data"];
			}) => {
				if (socket.client === undefined) return;

				const { topic } = data;
				const client = socket.client;
				const project = client.getProject();

				project.subscribeClient(client, topic);
			}
		);

		this.subscribe(
			"UNSUBSCRIBE",
			({
				socket,
				data,
			}: {
				socket: WebSocket;
				data: MessageMap["UNSUBSCRIBE"]["data"];
			}) => {
				if (socket.client === undefined) return;

				const { topic } = data;
				const client = socket.client;
				const project = client.getProject();

				project.unsubscribeClient(client, topic);
			}
		);

		this.subscribe("close", ({ socket }: { socket: WebSocket }) => {
			if (socket.client === undefined) return;

			this.unregisterClient(socket, {
				projectId: socket.client.getProject().getId(),
			});
		});
	}

	private unregisterClient(
		socket: WebSocket,
		data: MessageMap["UNREGISTER_CLIENT"]["data"]
	) {
		if (socket.client === undefined) return;

		const client = socket.client;
		const project = client.getProject();

		project.removeClient(client);

		if (project.numConnected === 0) {
			ProjectRepository.unregister(project);
		}

		socket.client = undefined;
	}
}
