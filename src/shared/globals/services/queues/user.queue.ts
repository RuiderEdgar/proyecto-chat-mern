import { BaseQueue } from './base.queue';
import { useWorker } from '@workers/user.worker';
import { IUserJob } from '@user/interfaces/userJob.interface';

class UserQueue extends BaseQueue {
	constructor() {
		super('users');
		this.processJob('addUserToDB', 5, useWorker.addUserToDB);
	}

	public addUserJob(name: string, data: IUserJob): void {
		this.addJob(name, data);
	}
}

export const userQueue: UserQueue = new UserQueue();
