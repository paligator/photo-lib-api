import User from "../models/user.model";
import { IUser } from "../models/user.model";
import * as C from "../helpers/common";
import { UserService } from "../service/userService";
import { hashPassword, comparePasswords } from "../helpers/authorization";
import request from "supertest";
import app from "../App";
import * as testC from "./helpers/common.test";

describe("first one", () => {

	beforeEach(async () => {
		//await testC.loadUsers();
	});

	it("success login", async (done: any) => {
		const res = await request(app)
			.post("/auth/login")
			.send({
				email: "editor1@gmail.com",
				password: "heslo123",
			});

		expect(res.status).toEqual(200);

		done();
	});

	it("failed login", async (done: any) => {
		const res = await request(app)
			.post("/auth/login")
			.send({
				email: "editor1@gmail.com",
				password: "wrong password",
			});

		expect(res.status).toEqual(401);

		done();
	});

	test("create new user", async () => {

		const wantedPassword = "heslo123";
		const wantedUser: IUser = new User({
			name: "SuperAdmin",
			email: "paligator@gmail.com",
			password: wantedPassword,
			roles: ["superAdmin", "admin", "editor"]
		});

		await request(app)
			.post("/auth/create-user")
			.send(wantedUser)
			.set({ "authorization": "Bearer " + testC.superAdminToken });

		const gotUser: IUser = await User.findOne({ email: wantedUser.email });

		expect(gotUser.name).toBe(wantedUser.name);
		expect(gotUser.roles).toIncludeSameMembers(wantedUser.roles);
		expect(await comparePasswords(gotUser.password, wantedPassword)).toBe(true);

	});

});

