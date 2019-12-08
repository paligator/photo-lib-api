module.exports = {
	globals: {
		"ts-jest": {
			tsConfig: "./tsconfig.json",
			diagnostics: true
		}
	},
	preset: "ts-jest",
	testEnvironment: "node",
	rootDir: "src/test",
	setupFilesAfterEnv: ["jest-extended"]
};