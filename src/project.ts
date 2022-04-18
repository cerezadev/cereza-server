import Client from "./client";
import DefaultMap from "./utils/map/DefaultMap";

export default class Project {
	private readonly id: string;
	private readonly clients: Set<Client> = new Set();
	private readonly topicClients = new DefaultMap<string, Set<Client>>();

	constructor(id: string) {
		this.id = id;
	}

	public getId() {
		return this.id;
	}

	public addClient(client: Client) {
		this.clients.add(client);
	}

	public removeClient(client: Client) {
		this.clients.delete(client);

		for (const clients of this.topicClients.values()) {
			clients.delete(client);
		}
	}

	public subscribeClient(client: Client, topic: string) {
		this.topicClients.computeIfAbsent(topic, () => new Set()).add(client);
	}

	public unsubscribeClient(client: Client, topic: string) {
		const topicClients = this.getTopicClients(topic);

		topicClients.delete(client);

		if (topicClients.size === 0) {
			this.topicClients.delete(topic);
		}
	}

	public getTopicClients(topic: string) {
		return this.topicClients.get(topic) ?? new Set();
	}

	get numConnected() {
		return this.clients.size;
	}
}
