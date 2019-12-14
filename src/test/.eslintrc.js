module.exports = {
	"root": true,
	"parserOptions": {
		"ecmaVersion": 2017
	},
	'env': {
		'es6': true,
		'node': true
	},
	"plugins": ["jest"],
	'extends': ["eslint:recommended", "plugin:jest/recommended"],
	'rules': {
		'jest/no-focused-tests': 'warn',
		'indent': 'off',
		'linebreak-style': [
			'error',
			'windows'
		],
		'quotes': [
			'warn',
			'double'
		],
		'semi': [
			'error',
			'always'
		],
		'no-console': 'warn',
	}
};