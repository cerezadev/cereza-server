export default class DefaultMap<T, U> extends Map<T, U> {
	public computeIfAbsent(key: T, valueFn: () => U) {
		const value = this.get(key);

		if (value !== undefined) {
			return value;
		}

		const defaultValue = valueFn();

		this.set(key, defaultValue);

		return defaultValue;
	}
}
