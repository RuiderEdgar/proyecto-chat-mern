import { createClient } from 'redis';
import Logger from 'bunyan';
import { config } from '@configs/configEnvs';
import { logger } from '@configs/configLogs';

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
	client: RedisClient;
	log: Logger;

	constructor(cacheName: string) {
		this.client = createClient({ url: config.REDIS_HOST });
		this.log = logger.createLogger(cacheName);
		this.cacheError();
	}

	private cacheError(): void {
		this.client.on('error', (err: unknown) => {
			this.log.error(err);
		});
	}
}
