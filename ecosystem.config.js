module.exports = {
	apps: [{
		name: 'photo-lib-api',
		script: './build/App.js',
		args: '',
		instances: '2',
		autorestart: true,
		max_restarts: 5,
		watch: false,
		max_memory_restart: '500M',
		merge_logs: true,
		env: {
			NODE_ENV: 'development'
		},
		env_production: {
			NODE_ENV: 'production'
		}
	}],

	deploy: {
		production: {
			user: 'photolib',
			host: '192.168.1.11',
			key: '/c/Users/pavol.zelenka/.ssh/paligator.pem',
			ref: 'origin/master',
			repo: 'git@github.com:paligator/photo-lib-api.git',
			path: '/home/photolib/photo-lib/photo-lib-api',
			'post-deploy': 'git checkout . && npm install ./replacer && node ./replacer /home/photolib/photo-lib/secrets.json ./config/production.json production && tsc && pm2 reload ecosystem.config.js --env production'
		}
	}
};
