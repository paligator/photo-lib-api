import { generateToken } from "../helpers/authorization";
import User from "../models/user.model";
import * as C from "../helpers/common";


describe("Authorization API", () => {
	it("should create new token", () => {

		const user = new User();
		user.email = "ahoj@palo.sk2";
		user.name = "ahoj palo";
		//	user.password = "hello";
		user.validTo = C.getMaxDate();
		user.roles = ["admin"];

		//	await user.save();

		generateToken(user);
	});

	it("test Date", () => {

		const a = C.getMaxDate();
		console.log("kurva som tu: " + a);

	});

});
