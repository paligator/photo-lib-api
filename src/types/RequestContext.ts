import { Schema } from "mongoose";

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

/**
 * @swagger
 * definitions:
 *   Response:
 *     type: object
 *     properties:
 *       status:
 *         type: string
 *         enum: ["success", "error"]
 *     required:
 *       - status
 */
export interface Response {
	status: "success" | "error";
	data: any;
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
 *         type: any
 *     required:
 *       - data
 */
export interface LoginResponse extends Response {
	data: string;
}