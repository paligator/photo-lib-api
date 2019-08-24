import { Path, POST, Security } from "typescript-rest";
import * as C from "../helpers/common";
import { generateToken } from "../helpers/authorization";
import { UserService } from "../service/userService";
import { UserInt } from "../models/user.model";
import { LoginData } from "../types";
import { UserRoles } from "../helpers/enums";

//TODO: what about salt???

@Path("/auth")
class AuthorizationRoute {

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
	@Security(UserRoles.SuperAdmin)
	@POST
	public async createUser(user: UserInt): Promise<any> {
		await UserService.createUser(user);
		return C.sendData();
	}

}

export default AuthorizationRoute;
