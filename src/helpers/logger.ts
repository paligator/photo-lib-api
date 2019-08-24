import winston from "winston";
import config from "config";
import moment from "moment";
import SPLAT from "triple-beam";

let myLogger: winston.Logger;

//TODO: rework to class

function setCustomColors() {
	const customColors: any = {
		silly: "grey",
		debug: "gray"
	};

	if (config.get("logger.colors.info") !== "default") {
		customColors.info = config.get("logger.colors.info");
	}
	winston.addColors(customColors);
}

function formatSplat(info: object): string {
	let splat: string;
	try {
		// @ts-ignore TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'.
		const parsedSplat: string[] = info[SPLAT];
		if (parsedSplat) {
			//TODO: I haven't found better way how force logger to log json on multiple lines, especially i had a problem to log graphql request body
			splat = JSON.stringify(splat)
				.replace(/\\n/g, "\n")
				.replace(/\\r/g, "\r")
				.replace(/\\t/g, "\t")
				.replace(/\\b/g, "\b")
				.replace(/\\f/g, "\f");
		} else {
			splat = "";
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error("error format splat", e);
		splat = "<<!!!! error format splat - see console log !!!>>";
	}
	return splat;
}

function getLogger(): winston.Logger {

	if (myLogger) {
		return myLogger;
	}
	const { combine, colorize, printf } = winston.format;

	setCustomColors();

	myLogger = winston.createLogger({
		format: combine(
			colorize({ all: true }),
			printf((info): string => {
				return `${moment(Date.now()).format("DD.MM.YYYY HH:mm:ss")} - ${info.level} : ${info.message}	${formatSplat(info)}`;
			})
		),
		transports: [new winston.transports.Console()]
	});
	myLogger.level = config.get("logger.level");
	myLogger.info("logger created");

	return myLogger;
}

export {
	getLogger
};
