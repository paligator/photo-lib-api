import User from "../models/user.model";
import { IUser } from "../models/user.model";
import * as C from "../helpers/common";
import { UserService } from "../service/userService";
import * as database from "../helpers/db";

beforeAll(async () => {
	await database.connect();
});

afterAll(async () => {
	database.close();
});


describe("first one", () => {

	test("should create new token", async () => {

		const user: IUser = new User({
			name: "Admin",
			email: "paliator@gmail.com",
			password: "heslo123",
			roles: ["superAdmin", "admin", "editor"]
		});

		await UserService.createUser(user);

	});

	test("test Date", () => {
		const a = C.getMaxDate();
		console.log("test Date: " + a);
	});

});

