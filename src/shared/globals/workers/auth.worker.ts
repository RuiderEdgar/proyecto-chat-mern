import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { authService } from '@services/db/auth.service';

const log: Logger = logger.createLogger('authWorker');

class AuthWorker {
	//agrega schemas de auth al servicio
	async addAuthUserToDB(job: Job, done: DoneCallback): Promise<void> {
		try {
			const { value } = job.data;
			await authService.createAuthUser(value);
			//una vez agregado el schema a la DB, el worker notifica que ya se ha procesado
			job.progress(100);
			done(null, job.data);
		} catch (error) {
			log.error(error);
			done(error as Error);
		}
	}
}

export const authWorker: AuthWorker = new AuthWorker();
