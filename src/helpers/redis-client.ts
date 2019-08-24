import { RedisClient, createClient, ClientOpts } from "redis";
import config from "config";
import * as C from "../helpers/common";


class MyRedisClient implements RedisClientInt {

	private client: RedisClient;

	public constructor(returnBuffers: boolean = false, database: number = 0) {

		const redisClientOpts: ClientOpts =
		{
			/* eslint-disable @typescript-eslint/camelcase */
			return_buffers: returnBuffers,

			// Here we return "just" warning and log error, because we don"t want to block client to continue,
			// error is returned only if lock for given Id exists, than we want to stop client
			/* eslint-disable @typescript-eslint/camelcase */
			retry_strategy: function (options: any): any {
				if (options.error && options.error.code === "ECONNREFUSED") {
					// End reconnecting on a specific error and flush all commands with a individual error
					C.logE("api-locker The server refused the connection");
					return { "warning": "The server refused the connection" };
				}
				if (options.total_retry_time > 5000) {
					// End reconnecting after a specific timeout and flush all commands with a individual error
					C.logE("api-locker Retry time exhausted");
					return { "warning": "Retry time exhausted" };
				}
				if (options.attempt > 3) {
					C.logE("api-locker Too many attempts");
					return { "warning": "Too many attempts" };
				}

				// reconnect after
				return Math.min(options.attempt * 100, 3000);
			}
		};

		const client = createClient(config.get("redisClient.port"), config.get("redisClient.host"), redisClientOpts);

		client.on("ready", function (): void {
			C.logI("connected to redis database ");
		});

		client.select(database);

		this.client = client;
	}

	public getValue(cacheKey: string): Promise<string> {

		return new Promise((resolve: any, reject: any): void => {

			this.client.get(cacheKey, (err: Error, data: string): boolean => {

				if (err) {
					reject(err);
				}

				if (!data) {
					return resolve(null);
				}

				return resolve(data);
			});

		});
	}

	public setValue(cacheKey: string, value: string, ttl: number): void {
		this.client.set(cacheKey, value);
		this.client.expire(cacheKey, ttl);
	}

	public setExpire(cacheKey: string, ttl: number): void {
		this.client.expire(cacheKey, ttl);
	}

	public getNativeClient(): object {
		return this.client;
	}

}

// TODO: MOVE TO COMMON
class KeyPair {
	public key: string;
	public value: string;

	public constructor(key: string, value: string) {
		this.key = key;
		this.value = value;
	}
}

class RedisClientMock implements RedisClientInt {

	private store: KeyPair[];

	public constructor() {
		this.store = [];
	}

	public getValue(cacheKey: string): Promise<string> {
		return new Promise((resolve): void => {
			const item = this.store.find((a: KeyPair): boolean => a.key === cacheKey);
			const val = (item) ? item.value : null;

			return resolve(val);
		});
	}

	public setValue(cacheKey: string, value: string, ttl: number): void {
		//TODO: here is something wrong, value shouldn't be just string, pictures too!!!
		C.logI(`cache setValue => ${cacheKey} = ... (${ttl})`);
		this.store.push(new KeyPair(cacheKey, value));
	}

	public setExpire(): void {
		return;
	}

}

interface RedisClientInt {
	getValue(cacheKey: string): Promise<string>;
	setValue(cacheKey: string, value: string | Buffer, ttl: number): void;
	setExpire(cacheKey: string, ttl: number): void;
}

function getRedisClient(): RedisClientInt {

	if (config.get("redisClient.usemock") === true) {
		return new RedisClientMock();
	} else {
		return new MyRedisClient(true, parseInt(config.get("redisClient.cachedImagesDatabase")));
	}
}

export {
	getRedisClient,
	MyRedisClient,
	RedisClientMock
};