import DefaultMap from "../map/DefaultMap";
import { SubscriberFn } from "./SubscriberFn";
import { UnsubscriberFn } from "./UnsubscriberFn";

export default class SubscriberManager {
	private readonly subscribers = new DefaultMap<
		string,
		Set<SubscriberFn<any>>
	>();

	public subscribe(id: string, fn: SubscriberFn<any>): UnsubscriberFn {
		const idSubscribers = this.subscribers.computeIfAbsent(
			id,
			() => new Set()
		);

		idSubscribers.add(fn);

		return () => this.unsubscribe(id, fn);
	}

	public unsubscribe(id: string, fn: SubscriberFn<any>) {
		const idSubscribers = this.getSubscribers(id);

		idSubscribers.delete(fn);

		if (idSubscribers.size === 0) {
			this.subscribers.delete(id);
		}
	}

	public getSubscribersIds() {
		return this.subscribers.keys();
	}

	public hasSubscriberId(id: string) {
		return this.subscribers.has(id);
	}

	public getSubscribers(id: string) {
		return this.subscribers.get(id) ?? new Set();
	}

	public invokeSubscribers(id: string, data: any) {
		for (const subscriber of this.getSubscribers(id)) {
			subscriber(data);
		}
	}
}
