import { Path, POST, Security } from "typescript-rest";
import * as C from "../helpers/common";
import { generateToken } from "../helpers/authorization";
import { UserService } from "../service/userService";
import { IUser } from "../models/user.model";
import { UserRoles } from "../helpers/enums";
import { LoginData } from "../types";

//TODO: what about salt???

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
 *         schema:
 *           $ref: "#/definitions/Response"
 *       '401':
 *         description: Bad username, not found in db
 *       '403':
 *         description: Username and password don't match
 */
	@Path("/login")
	@POST
	public async login(body: LoginData): Promise<any> {

		const email = body.email;
		const password = body.password;
		const user = await UserService.findByEmail(email, true);
		const canUserLogIn = await UserService.canUserLogIn(user, password);

		if (canUserLogIn === true) {
			const token = generateToken(user);
			return C.sendData({ token });
		}

	}

	@Path("/create-user")
	//TODO: DELETE COMMENT
	//@Security(UserRoles.SuperAdmin)
	@POST
	public async createUser(user: IUser): Promise<any> {
		await UserService.createUser(user);
		return C.sendData();
	}

}

export default AuthorizationRoute;
