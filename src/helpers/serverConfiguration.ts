import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createContext } from "./authorization";
import * as C from "./common";
import morgan from "morgan";
import { Server as TypeScriptRestServer } from "typescript-rest";
import schema from "../schemas";
import resolvers from "../resolvers";
import { Strategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import { PassportAuthenticator } from "typescript-rest";
import config from "config";
import { RequestContext, RequestUser } from "../types";
import routes from "../routes";
import compression from "compression";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import ConstraintDirective from "graphql-constraint-directive";


function createApolloServer(): ApolloServer {
	const apolloServer = new ApolloServer({
		typeDefs: schema,
		resolvers,
		schemaDirectives: { constraint: ConstraintDirective },
		context: async ({ req }) => {
			const context: RequestContext = await createContext(req);
			return context || {};
		},
		formatError: (err) => {

			if (err instanceof C.PhotoAuthenticationError || err.originalError instanceof C.PhotoAuthenticationError) {
				C.logW(`GrapQL authoriziation error: ${err.message}`);
			} else {
				C.logE(`GrapQL bad error: ${C.errorToString(err)}`);
			}

			return {
				status: "error",
				message: err.message,
			};
		}
	});

	return apolloServer;
}

function logEveryRequest() {
	return morgan(function (tokens: morgan.TokenIndexer, req: any, res: express.Response): string {

		const method = tokens.method(req, res);
		const status: string = tokens.status(req, res);
		const url: string = tokens.url(req, res);
		const contentLength = tokens.res(req, res, "content-length");
		const responseTime = tokens["response-time"](req, res);

		const body = req.body;

		if (status === "200") {

			if (url === "/graphql" && body.operationName === "IntrospectionQuery") {
				//C.logS(`${method} ${url} ${status} ${contentLength} - ${responseTime} ms operation: IntrospectionQuery`);
			} else {
				C.logI(`${method} ${url} ${status} ${contentLength} - ${responseTime} ms body: `, body);
			}
		} else {
			C.logW(`${method} ${url} ${status} ${contentLength} - ${responseTime} ms`);
		}

		return null;
	});
}

function crateTypeScriptRestServer(app: express.Application) {
	const jwtConfig: StrategyOptions = {
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: config.get("authorization.tokenKey"),
	};

	const strategy = new Strategy(jwtConfig, (payload: any, done: (a: null, b: any) => void) => {
		const user: RequestUser = {
			roles: payload.roles,
			email: payload.email
		};
		done(null, user);
	});

	TypeScriptRestServer.registerAuthenticator(new PassportAuthenticator(strategy, {
		deserializeUser: (user: string) => { JSON.parse(user); },
		serializeUser: (user: any) => {
			return JSON.stringify(user);
		}
	}));


	TypeScriptRestServer.buildServices(app, ...routes);
}

function handleApplicationError() {
	return (err: any, req: any, res: any, next: any): void => {

		//TODO: put all it into some try-catch.. 

		C.logE(`Bad bad error: ${C.errorToString(err)}`);

		let statusCode;
		let message;

		if ((err instanceof Error) === false || !err) {
			statusCode = 500;
			message = "Unknow error";
			next();
		} else {
			statusCode = err.statusCode || 500;
			message = err.message || "Internal Error";
		}

		res.set("Content-Type", "application/json");
		res.status(statusCode);
		res.json(
			{
				status: "error",
				message,
				data: err.data || undefined
			});

	};
}

function handleUnhandledErrors() {
	//maybe put it into some try-catch.. 	
	return (reason: any): void => {
		C.logE(`Unhandled Rejection at: ${reason.stack || reason}`);
	};
}

function addExtraHeaders() {
	return function (req: any, res: any, next: any): void {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	};
}

function addSwagger(app: express.Application) {

	const swaggerDefinition = {
		openapi: "3.0.0",
		info: {
			title: "Photo-lib Swagger API",
			version: "1.0.0",
			description: "Endpoints to test photolib-api",
		},
		host: C.getPhotoLibUrl(),
		basePath: "/",
		securityDefinitions: {
			bearerAuth: {
				type: "apiKey",
				name: "Authorization",
				scheme: "bearer",
				in: "header",
			},
		},
	};

	const options = {
		swaggerDefinition,
		apis: [C.getPath("/src/**/*.ts")],
	};

	const swaggerSpec = swaggerJSDoc(options);

	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


	app.get("/swagger.json", (req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerSpec);
	});

}

function shouldCompress(req: any, res: any) {
	// don't compress responses with this request header
	if (req.headers["x-no-compression"]) {
		return false;
	}

	// fallback to standard filter function
	return compression.filter(req, res);
}

function getCompression() {
	return compression({ filter: shouldCompress });
}

export {
	createApolloServer,
	logEveryRequest,
	crateTypeScriptRestServer,
	handleApplicationError,
	handleUnhandledErrors,
	addExtraHeaders,
	addSwagger,
	getCompression
};