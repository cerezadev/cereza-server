import { WebSocket } from "uWebSockets.js";
import Project from "./project";

export default class Client {
	private readonly socket: WebSocket;
	private readonly project: Project;

	constructor(socket: WebSocket, project: Project) {
		this.socket = socket;
		this.project = project;
	}

	public getProject() {
		return this.project;
	}

	public send(message: string) {
		this.socket.send(message);
	}
}
