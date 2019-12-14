const testC = require("./helpers/testHelpers");
const C = require("../../build/helpers/common");

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




