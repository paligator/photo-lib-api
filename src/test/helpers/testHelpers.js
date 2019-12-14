const User = require("../../../build/models/user.model").default,
	a = require("../../../build/helpers/authorization"),
	C = require("../../../build/helpers/common"),
	database = require("../../../build/helpers/db");

async function loadUsers() {

	C.logI("LOAD USERS - DO IT");

	await User.deleteMany({});
	const users = [
		{ name: "SuperAdmin", email: "admin@photo.sk", password: "heslo123", roles: ["superAdmin", "editor"], validTo: C.getMaxDate() },
		{ name: "editor1", email: "editor1@gmail.com", password: "heslo123", roles: ["editor"], validTo: C.getMaxDate() }
	];
	await User.insertMany(users);

	C.logI("LOAD USERS - IS DONE");
}

async function initLoginTokens() {
	const superAdmin = await User.findOne({ name: "SuperAdmin" });
	const superAdminToken = await a.generateToken(superAdmin);
	C.logI(`new superAdmin token is ${superAdminToken}`);
	return superAdminToken;
}

async function connectDb() {
	await database.connect();
}

async function closeDb() {
	await database.close();
}

module.exports = {
	loadUsers, initLoginTokens, connectDb, closeDb
};