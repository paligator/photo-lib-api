import { Schema } from "mongoose";
import express from "express";

export interface RequestContext {
	userId: Schema.Types.ObjectId;
	userName: string;
	userEmail: string;
	userRoles: [string];
}

/**
 * @swagger
 * definitions:
 *   LoginData:
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         example: "ahoj@ahoj.sk"
 *       password:
 *         type: string
 *         format: password
 *         example: 123
 *     required:
 *       - email
 *       - password
 */
export interface LoginData {
	email: string;
	password: string;
}

export interface LoginGoogleData {
	token: string;
}

/**
 * @swagger
 * definitions:
 *   ChangePassword:
 *     type: object
 *     properties:
 *       newPassword:
 *         type: string
 *         format: password
 *         example: 123
 *     required:
 *       - newPassword
 */
export interface ChangePassword extends Response {
	newPassword: string;
}

/**
 * @swagger
 * definitions:
 *   Response:
 *     type: object
 *     properties:
 *       status:
 *         type: string
 *         enum: ["success", "error"]
 *         example: "success"
 *     required:
 *       - status
 */
export class Response {
	public status: string;
	public data?: any;

	public constructor(status: "success" | "error") {
		this.status = status;
	}
}

/**
 * @swagger
 * definitions:
 *   LoginResponse:
 *     allOf:
 *       - $ref: '#/definitions/Response'
 *     type: object
 *     properties:
 *       data:
 *         type: object
 *         properties: 
 *           token:
 *             type: string
 *             example: "eyJhbGciOiJIUrzI1NiIsInR5dCI6IkpXVCJ9.eyJ1c2VyIjoiNWQ2N2JhNWE4ZjZlOTh0MzY4Y2E1MTljIiwiZW1haWwiOiJwYWxpZ2F0b3JAZ21haWwuY64tIiwicm9sZXMiOlsic3VwZXJBZG1pbiIsImFkbWluIiwiZWRpdG9yIl0sImlhdCI6MTU2NzQzODkyMiwiZXhwIjoxNTY3ODcwOTIyfQ.kFjbNaG5mR32aHa7uJE0rGRwXEsMnOpvg9G_BDLGCvc"
 *         required:
 *           - token
 *     required:
 *       - data
 */
export class LoginResponse extends Response {
	public data: any;

	public constructor(jwtToken: string) {
		super("success");
		this.data = {
			token: jwtToken
		};
	}
}


/**
 * @swagger
 * definitions:
 *   ErrorResponse:
 *     allOf:
 *       - $ref: '#/definitions/Response'
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *         example: Wrong email or password
 *     required:
 *       - message
 */
export class ErrorResponse extends Response {
	public data: any;

	public constructor(message: string) {
		super("error");
		this.data = {
			message: message
		};
	}
}

export interface RequestUser {
	email: string;
	roles: [string];
}

export interface PhotoLibRequest extends express.Request {
	user: RequestUser;
	body: any;
}

export interface GoogleTokenData {
	email: string;
	name: string;
}

export interface TokenData {
	id: Schema.Types.ObjectId;
	email: string;
	name: string;
	roles: [string];
}