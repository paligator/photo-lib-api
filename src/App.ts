import express from "express";
import cookieParser from "cookie-parser";
import config from "config";
import * as C from "./helpers/common";
import * as database from "./helpers/db";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import * as serverConfig from "./helpers/serverConfiguration";

const app: express.Application = express();
const apolloServer: ApolloServer = serverConfig.createApolloServer();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors()); /* without cors OPTIONS request wouldn't work */
app.use(serverConfig.addExtraHeaders());
app.use(serverConfig.logEveryRequest());
apolloServer.applyMiddleware({ app, path: "/graphql" });
serverConfig.crateTypeScriptRestServer(app);
app.use(serverConfig.handleApplicationError());
process.on("unhandledRejection", serverConfig.handleUnhandledErrors());

/** Start application */
const port = config.get("server.port");
app.listen(port, (): void => {
	C.logI(`*****************            Started webserver on port ${port} with ${process.env.NODE_ENV}            *****************`);
});

database.connect();

module.exports = app;