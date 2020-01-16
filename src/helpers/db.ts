import mongoose from "mongoose";
import config from "config";
import * as C from "../helpers/common";

async function connect(): Promise<string> {
	const mongoDBUrl: string = config.get("db.connectionString");

	// parameters are there to get rid of deprecation warnings in logs
	mongoose.connect(mongoDBUrl, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true });
	mongoose.Promise = global.Promise;
	const db = mongoose.connection;

	db.on("SIGINT", function (): void {
		db.close(function (): void {
			C.logI("Mongo -> db connection closed due to process termination");
			process.exit(0);
		});
	});

	return new Promise((resolve, reject): void => {
		db.on("connected", function (): void {
			C.logI("Mongo -> connected to database");
			return resolve("connected");
		});

		db.on("disconnected", function (): void {
			C.logI("Mongo -> disconnected from database");
			return reject("disconnected");
		});

		db.on("error", function (error: Error): void {
			C.logI("Mongo -> connection error", error);
			return reject("error");
		});
	});
}

async function close() {
	mongoose.connection.close();
}

export { connect, close };
