// must be here, otherwise type-script would error TS2339, ie error TS2339: Property 'toIncludeSameMembers' does not exist on type 'Matchers<string[]>'.
import "jest-extended";

import User, { IUser, UserSchema } from "../../models/user.model";
import * as C from "../../helpers/common";
import request from "supertest";
import app from "../../App";
import * as a from "../../helpers/authorization";
import * as database from "../../helpers/db";

export let superAdminToken: string;

afterAll(async (done) => {
	C.logI("Jest.afterAll -> Cleaning after tests");
	await database.close();
	done();
});

async function initLoginTokens() {
	const superAdmin: IUser = await User.findOne({ name: "SuperAdmin" });
	superAdminToken = await a.generateToken(superAdmin);
	C.logI(`new superAdmin token is ${superAdminToken}`);
}

test("testing started", async () => {
});


export async function loadUsers() {
	await User.deleteMany({});
	const users: IUser[] = [
		new User({ name: "SuperAdmin", email: "admin@photo.sk", password: "heslo123", roles: ["superAdmin", "editor"] }),
		new User({ name: "editor1", email: "editor1@gmail.com", password: "heslo123", roles: ["editor"] })
	];
	await User.insertMany(users);
}

beforeAll(async (done) => {
	C.logI("Jest.beforeAll -> Prepare setup all Tests");
	await database.connect();
	await loadUsers();
	await initLoginTokens();

	done();
});
