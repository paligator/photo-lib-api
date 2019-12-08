import User, { IUser } from "../../models/user.model";
import * as a from "../../helpers/authorization";
import * as C from "../../helpers/common";
import * as database from "../../helpers/db";

export let superAdminToken: string;

export async function loadUsers() {

	C.logI("LOAD USERS - DO IT");

	await User.deleteMany({});
	const users: IUser[] = [
		new User({ name: "SuperAdmin", email: "admin@photo.sk", password: "heslo123", roles: ["superAdmin", "editor"], validTo: C.getMaxDate() }),
		new User({ name: "editor1", email: "editor1@gmail.com", password: "heslo123", roles: ["editor"], validTo: C.getMaxDate() })
	];
	await User.insertMany(users);

	C.logI("LOAD USERS - IS DONE");
}

export async function initLoginTokens() {
	const superAdmin: IUser = await User.findOne({ name: "SuperAdmin" });
	superAdminToken = await a.generateToken(superAdmin);
	C.logI(`new superAdmin token is ${superAdminToken}`);
}

export async function connectDb(){
	await database.connect();
}

export async function closeDb(){
	await database.close();
}