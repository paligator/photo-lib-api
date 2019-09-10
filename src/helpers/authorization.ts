import { IUser } from "../models/user.model";
import jwt from "jsonwebtoken";
import config from "config";
import * as C from "../helpers/common";
import * as enums from "./enums";
import { RequestContext } from "../types";
import bcrypt from "bcrypt";

//TODO: move to constants
const HEADER_NAME = "authorization";

function generateToken(user: IUser): string {

	const token = jwt.sign(
		{
			user: user.id,
			email: user.email,
			roles: user.roles
		},
		config.get("authorization.tokenKey"),
		{ expiresIn: config.get("authorization.tokenExpiryTime") });

	return token;
}

async function verifyToken(token: string): Promise<any> {
	const result = await jwt.verify(token, config.get("authorization.tokenKey"));
	return result;
}

function doAuthorization(context: RequestContext, reqRole: string, operation: string = ""): boolean {

	if (context.userRoles && (context.userRoles.indexOf(reqRole) > -1 || context.userRoles.indexOf(enums.UserRoles.SuperAdmin) > -1)) {
		return true;
	} else {
		throw new C.PhotoAuthenticationError(`User ${context.userEmail} is not authorized for operation ${operation}`);
	}
}

//FIXME: return Promise<RequestContext>
async function createContext(req: any): Promise<any> {

	if (req && req.body && req.body.operationName === "IntrospectionQuery") {
		return;
	}

	let authToken = null;
	let currentUser: any = null;

	try {

		authToken = req.headers[HEADER_NAME];

		//TODO: think about it, if there is not token
		if (authToken) {
			currentUser = await verifyToken(authToken);

			if (!currentUser) {
				throw new C.PhotoAuthenticationError("Invalid token");
			}

			const context: RequestContext =
			{
				userId: currentUser.id,
				userName: currentUser.userName,
				userEmail: currentUser.email,
				userRoles: currentUser.roles
			};

			return context;
		} else {
			return {};
		}

	} catch (e) {
		C.logW(`Invalid token. Message: ${e.message} >> Token: ${authToken}`);
		throw new C.PhotoAuthenticationError("Unable to authenticate using auth token");
	}
}

async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

async function comparePasswords(password: string, candidatePassword: string): Promise<boolean> {
	return new Promise((resolve): void => {
		bcrypt.compare(candidatePassword, password, function (err: Error, isMatch: boolean) {

			if (err) throw (err);

			resolve(isMatch);
		});
	});
}

export {
	generateToken,
	verifyToken,
	doAuthorization,
	createContext,
	hashPassword,
	comparePasswords
};