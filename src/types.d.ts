import "uWebSockets.js";
import Client from "./client";

declare module "uWebSockets.js" {
	interface WebSocket {
		client?: Client;
	}
}

interface Message<T, U> {
	type: T;
	data: U;
}

type RegisterClient = Message<"REGISTER_CLIENT", { projectId: string }>;
type UnregisterClient = Message<"UNREGISTER_CLIENT", { projectId: string }>;
type Publish = Message<"PUBLISH", { topic: string; data: any }>;
type Subscribe = Message<"SUBSCRIBE", { topic: string }>;
type Unsubscribe = Message<"UNSUBSCRIBE", { topic: string }>;

type MessageMap = {
	REGISTER_CLIENT: RegisterClient;
	UNREGISTER_CLIENT: UnregisterClient;
	PUBLISH: Publish;
	SUBSCRIBE: Subscribe;
	UNSUBSCRIBE: Unsubscribe;
};
