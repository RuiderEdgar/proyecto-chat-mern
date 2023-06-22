import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { userService } from '@services/db/user.service';

const log: Logger = logger.createLogger('userWorker');

class UserWorker {
	async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
		try {
			const { value } = job.data;
			//process pending
			await userService.addUserData(value);
			//notificacion
			job.progress(100);
			done(null, job.data);
		} catch (error) {
			log.error(error);
			done(error as Error);
		}
	}
}

export const useWorker: UserWorker = new UserWorker();
