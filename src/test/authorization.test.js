require("jest-extended");
const bcrypt = require("bcrypt");
const request = require("supertest");

const User = require("../../build/models/user.model").default;
const { comparePasswords, hashPassword } = require("../../build/helpers/authorization");
const { app } = require("../../build/App");
const testC = require("./helpers/testHelpers");
const C = require("../../build/helpers/common");

describe("Athorization Test Suite", () => {

	let superAdminToken;

	beforeAll(async () => {
		C.logI("before All Authorization Tests");
		await testC.connectDb();
		await testC.loadUsers();
		await testC.initLoginTokens();
		superAdminToken = await testC.initLoginTokens();
	});

	beforeEach(() => {
		jest.restoreAllMocks();
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
		const wantedUser = new User({
			name: "SuperAdmin",
			email: "paligator@gmail.com",
			password: wantedPassword,
			roles: ["superAdmin", "admin", "editor"]
		});

		const res = await request(app)
			.post("/auth/create-user")
			.send(wantedUser)
			.set({ "authorization": "Bearer " + superAdminToken });

		expect(res.status).toBe(200);

		const gotUser = await User.findOne({ email: wantedUser.email });
		expect(gotUser).not.toBeNil();
		expect(gotUser.name).toBe(wantedUser.name);
		expect(gotUser.roles).toIncludeSameMembers(wantedUser.roles);
		expect(await comparePasswords(gotUser.password, wantedPassword)).toBe(true);
	});

	test("hash password by mock", async () => {

		jest.spyOn(bcrypt, "hash").mockImplementation(() => Promise.resolve("*********"));

		const hashedPassword = await hashPassword("Ahoj123");
		C.logI("Hashed password by mock: " + hashedPassword);
		expect(hashedPassword).toBe("*********");
	});

	test("hash password", async () => {
		const hashedPassword22 = await hashPassword("Ahoj123");
		C.logI("Hashed password: " + hashedPassword22);
		expect(hashedPassword22).not.toBeNil();
	});

	afterAll(async () => {
		await testC.closeDb();
		C.logI("after All Authorization Tests");
	});

});

