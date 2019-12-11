// must be here, otherwise type-script would error TS2339, ie error TS2339: Property 'toIncludeSameMembers' does not exist on type 'Matchers<string[]>'.
import "jest-extended";
import * as C from "../helpers/common";
import * as testC from "./helpers/testHelpers";

describe("Common Test Suite", () => {

	beforeAll(async () => {
		C.logI("before All Common Tests");
		await testC.connectDb();
		await testC.initLoginTokens();
	});

	afterAll(async () => {
		await testC.closeDb();
		C.logI("after All Common Tests");
	});

	test("Common Test -> Dummy test", () => {
		C.logI("Common ->  Dummy test");
		expect(null).toBe(null);
	});

});




