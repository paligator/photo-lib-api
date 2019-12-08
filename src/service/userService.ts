import * as C from "../helpers/common";
import User, { IUser } from "../models/user.model";
import passwordValidator from "password-validator";
export default class UserService {

	public static async findByEmail(email: string, silent: boolean = false): Promise<IUser> {

		const user = await User.findOne({ email });

		if (!user && silent === false) {
			throw new C.PhotoError(`User with email ${email} was not found`);
		}

		return user;
	}

	public static async createUser(user: IUser): Promise<IUser> {
		const userDb = new User({
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

	public static async changeUserPassword(user: IUser, newPassword: string) {

		const schema = new passwordValidator();
		schema
			.is().min(6)
			.is().max(20)
			.has().uppercase()
			.has().lowercase()
			.has().digits()
			.has().not().spaces();

		const passwordValidationErrors = schema.validate(newPassword, { list: true });

		if (passwordValidationErrors === false || (passwordValidationErrors as string[]).length > 0) {
			throw new C.PhotoError(`Password complexity is not enough: ${passwordValidationErrors}`);
		}

		user.password = newPassword;
		await user.save();
	}
}

export {
	UserService
};
