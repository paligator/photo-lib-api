module.exports = {
	globals: {
		"ts-jest": {
			tsConfig: "./tsconfig.json",
			diagnostics: false
		}
	},
	preset: "ts-jest",
	testEnvironment: "node",
	rootDir: "src/test",
	setupFilesAfterEnv: ["jest-extended"]
};