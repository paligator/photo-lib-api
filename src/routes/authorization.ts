import { Path, POST, Security, ContextResponse, ContextRequest } from "typescript-rest";
import * as C from "../helpers/common";
import { generateToken, parseGoogleToken } from "../helpers/authorization";
import { UserService } from "../service/userService";
import { IUser } from "../models/user.model";
import { UserRoles, Authentication } from "../helpers/enums";
import { LoginData, LoginGoogleData, LoginResponse, ErrorResponse, ChangePassword, PhotoLibRequest, GoogleTokenData } from "../types";
import express from "express";

@Path("/auth")
class AuthorizationRoute {

	/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Users
 *     name: Login
 *     summary: Logs in a user
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           $ref: '#/definitions/LoginData'
 *     responses:
 *       '200':
 *         description: User found and logged in successfully
 *         content:
 *           application/json:
 *            schema: 
 *              $ref: '#/definitions/LoginResponse' 
 *       '401':
 *         description: Wrong credentials
 *         content:
 *           application/json:
 *            schema: 
 *              $ref: '#/definitions/ErrorResponse' 
 */
	@Path("/login")
	@POST
	public async login(body: LoginData, @ContextResponse res: express.Response): Promise<LoginResponse> {

		const email = body.email;
		const password = body.password;
		const user = await UserService.findByEmail(email, true);

		try {
			await UserService.canUserLogIn(user, password, Authentication.Password);
		} catch (e) {
			if (e instanceof C.PhotoAuthenticationError) {
				C.logI(`User ${body.email} can not login: ${e.message}`);
				res.statusCode = 401;
				return new ErrorResponse(e.message);
			}
			throw e;
		}

		const token = generateToken(user);
		return new LoginResponse(token);
	}

	@Path("/login-google")
	@POST
	public async loginGoogle(body: LoginGoogleData, @ContextResponse res: express.Response): Promise<LoginResponse> {

		// if (process.env.NODE_ENV === "development-local") {
		// 	const user = await UserService.findByEmail("paligator@gmail.com");
		// 	const token = generateToken(user);
		// 	return new LoginResponse(token);
		// }

		try {
			const googleTokenData: GoogleTokenData = await parseGoogleToken(body.token);
			const user = await UserService.findUserByGoogleToken(googleTokenData);
			const token = generateToken(user);
			return new LoginResponse(token);
		} catch (e) {
			if (e instanceof C.PhotoAuthenticationError) {
				C.logE("User can not login: ", e);
				res.statusCode = 401;
				return new ErrorResponse(e.message);
			}
			throw e;
		}
	}


	@Path("/create-user")
	@Security(UserRoles.SuperAdmin)
	@POST
	public async createUser(user: IUser): Promise<any> {
		await UserService.createUser(user);
		return C.sendData();
	}

	@Path("/change-password")
	@Security()
	@POST
	public async changePassword(changePasswordData: ChangePassword, @ContextRequest req: PhotoLibRequest): Promise<any> {

		const user: IUser = await UserService.findByEmail(req.user.email);
		await UserService.changeUserPassword(user, changePasswordData.newPassword);

		return C.sendData();
	}

}

export default AuthorizationRoute;
