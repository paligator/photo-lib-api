import express from "express";
import cookieParser from "cookie-parser";
import config from "config";
import * as C from "./helpers/common";
import * as database from "./helpers/db";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import * as serverConfig from "./helpers/serverConfiguration";
import * as http from "http";

const app: express.Application = express();
const apolloServer: ApolloServer = serverConfig.createApolloServer();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); /* without cors OPTIONS request wouldn't work */
app.use(serverConfig.addExtraHeaders());
app.use(serverConfig.logEveryRequest());
serverConfig.addSwagger(app);
apolloServer.applyMiddleware({ app, path: "/graphql" });
serverConfig.crateTypeScriptRestServer(app);
app.use(serverConfig.handleApplicationError());
process.on("unhandledRejection", serverConfig.handleUnhandledErrors());

/** Start application */
const port = config.get("server.port");
export const server: http.Server = app.listen(port, (): void => {
	C.logI(`*****************            Started webserver on port ${port} with ${process.env.NODE_ENV}            *****************`);

	//I really don't understand why, but without this test were failing with error: Jest has detected the following 1 open handle potentially keeping Jest from exiting:
	server.close(function () {
	});
});



process.on("SIGTERM", () => {
	// eslint-disable-next-line no-console
	console.log("SIGTERM signal received. \n Closing http server.");
	server.close(() => {
		// eslint-disable-next-line no-console
		console.log("Http server closed.");
		database.close();
	});
});

database.connect();

export default app;