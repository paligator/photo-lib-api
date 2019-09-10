import User from "../models/user.model";
import { IUser } from "../models/user.model";
import * as C from "../helpers/common";
import { UserService } from "../service/userService";
import * as database from "../helpers/db";
import { hashPassword, comparePasswords } from "../helpers/authorization";

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	database.close();
});


describe("first one", () => {

	beforeEach(async () => {
		await User.deleteMany({});
	});

	test("should create new user", async () => {

		const wantedPassword = "heslo123";
		const wantedUser: IUser = new User({
			name: "SuperAdmin",
			email: "paligator@gmail.com",
			password: wantedPassword,
			roles: ["superAdmin", "admin", "editor"]
		});

		await UserService.createUser(wantedUser);

		const gotUser: IUser = await User.findOne({ email: wantedUser.email });

		expect(gotUser.name).toBe(wantedUser.name);
		expect(gotUser.roles).toIncludeSameMembers(wantedUser.roles);
		expect(await comparePasswords(gotUser.password, wantedPassword)).toBe(true);


	});

	test("hash password", async () => {
		const password = "heslo123";
		C.logI(`Lets hash password: ${password}`);
		const hashedPassword = await hashPassword(password);
		C.logI(`Hashed password id: ${hashedPassword}`);
	});

});

