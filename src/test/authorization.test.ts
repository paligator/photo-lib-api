import "jest-extended";
import User from "../models/user.model";
import { IUser } from "../models/user.model";
import { comparePasswords } from "../helpers/authorization";
import request from "supertest";
import { app } from "../App";
import * as testC from "./helpers/testHelpers";
import * as C from "../helpers/common";

describe("Athorization Test Suite", () => {

	beforeAll(async () => {
		await testC.connectDb();
		await testC.initLoginTokens();
		await testC.loadUsers();
	});

	afterAll(async () => {
		await testC.closeDb();
	});

	test("success login", async () => {
		C.logI("test login");
		expect(null).toBe(null);
		const res = await request(app)
			.post("/auth/login")
			.send({
				email: "editor1@gmail.com",
				password: "heslo123",
			});

		expect(res.status).toEqual(200);
	});

	test("failed login", async () => {
		const res = await request(app)
			.post("/auth/login")
			.send({
				email: "editor1@gmail.com",
				password: "wrong password",
			});

		expect(res.status).toEqual(401);
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

