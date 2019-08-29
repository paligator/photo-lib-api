import * as C from "../helpers/common";
import User, { IUser } from "../models/user.model";


class UserService {

	public static async findByEmail(email: string, silent: boolean = false): Promise<IUser> {

		const user = await User.findOne({ email });

		if (!user && silent === false) {
			throw new C.PhotoError(`User with email ${email} was not found`);
		}

		return user;
	}

	public static async createUser(user: IUser): Promise<IUser> {
		let userDb = new User({
			email: user.email,
			name: user.name,
			password: user.password,
			roles: user.roles
		});

		await userDb.save();
		return userDb;
	}

	public static async canUserLogIn(user: IUser, providedPassword: string): Promise<boolean> {
		if (!user || !await user.validatePassword(providedPassword)) {
			throw new C.PhotoAuthenticationError("Invalid username or password");
		}

		const isUserExpired = user.isExpired();
		if (isUserExpired === true) {
			throw new C.PhotoAuthenticationError("User is expired");
		}

		return true;
	}


}

export {
	UserService
};
