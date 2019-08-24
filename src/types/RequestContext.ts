import { Schema } from "mongoose";

export interface RequestContext {
	userId: Schema.Types.ObjectId;
	userName: string;
	userEmail: string;
	userRoles: [string];
}

export interface LoginData {
	email: string;
	password: string;
}