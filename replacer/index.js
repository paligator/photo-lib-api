/* eslint-disable */

const replace = require("replace-in-file");
const fs = require('fs');

async function replaceSecrets() {

	var args = process.argv.slice(2);

	const environment = args[0];
	const secretsConfigPath = args[1];
	const destinationConfigPath = args[2];

	console.log(`Let's replace secrets for "${environment}" from secretsConfig "${secretsConfigPath}" to config "${destinationConfigPath}"`);

	const secretsConfig = await getSecretsConfig(secretsConfigPath);
	const secrets = secretsConfig[environment];
	const from = [];
	const to = [];

	for (var key in secrets) {
		console.log(`replace: ${key} -> ${secrets[key]}`);
		from.push("SECRET " + key);
		to.push(secrets[key]);
	}

	const options = {
		files: destinationConfigPath,
		from: from,
		to: to,
	};

	const results = await replace(options);

	console.log(`\nReplace result: ${JSON.stringify(results)}`);
	console.log("==========      FINITO      ==========");

}

async function getSecretsConfig(secretsConfigPath) {
	let secretsConfig;

	await new Promise(resolve => {
		fs.readFile(secretsConfigPath, 'utf8', function (err, data) {
			if (err) throw err;
			secretsConfig = JSON.parse(data);
			resolve();
		});
	});

	return secretsConfig;
}

/******* START POINT *******/
function letsGo() {
	return new Promise(resolve => {
		setTimeout(async () => {
			await replaceSecrets();
		}, 10000);
	});
}

letsGo();