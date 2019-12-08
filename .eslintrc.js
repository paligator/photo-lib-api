module.exports = {
	'env': {
		'es6': true,
		'node': true
	},
	'parser': '@typescript-eslint/parser',
	"plugins": ['@typescript-eslint', "jest"],
	"parserOptions": {
		"project": "./tsconfig.json"
	},
	'extends': ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:jest/recommended"],
	// 'extends': ["typescript", "typescript/prettier"],
	'globals': {
		'Atomics': 'readonly',
		'SharedArrayBuffer': 'readonly'
	},
	'parserOptions': {
		'ecmaVersion': 9,
		'sourceType': 'module',
	},
	'rules': {
		'indent': 'off',
		'@typescript-eslint/indent': ['warn', 'tab'],
		'@typescript-eslint/camelcase': ['warn', { "properties": "always" }],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		/*TODO toto je len docasne */
		'@typescript-eslint/no-explicit-any': [0],
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
		'interface-name': [0, 'never']
	}
};