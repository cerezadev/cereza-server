import WebSocketServer from "./server";

const startServer = (port: number) => {
	new WebSocketServer(port, () =>
		console.log(`Started Cereza server on port ${PORT}.`)
	);
};

const isPort = (num: number) => num >= 1 && num <= 65535;

const PORT = process.argv[2];

if (PORT === undefined) {
	console.error("PORT not specified as argument.");
} else if (isNaN(parseInt(PORT))) {
	console.error("PORT must be an integer.");
} else if (!isPort(Number(PORT))) {
	console.error("PORT must be a valid port. (1-65535)");
} else {
	startServer(Number(PORT));
}
