import { BaseCache } from './base.cache';
import { IUserDocument } from '@user/interfaces/userDocument.interfaces';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { ServerError } from '@helpers/errors/serverError';
import { Generators } from '@helpers/generators/generator';

const log: Logger = logger.createLogger('userCache');

export class UserCache extends BaseCache {
	constructor() {
		super('userCache');
	}

	public async saveToUserCache(key: string, userUid: string, creadetUser: IUserDocument): Promise<void> {
		//desacoplar los datos del usuario
		const createdAt = new Date();
		const {
			_id,
			uId,
			username,
			email,
			avatarColor,
			blocked,
			blockedBy,
			postsCount,
			followersCount,
			followingCount,
			notificacions,
			work,
			location,
			school,
			quote,
			social,
			bgImageId,
			bgImageVersion
		} = creadetUser;

		//transformar los datos a redis object
		const dataToSave = {
			_id: `${_id}`,
			uId: `${uId}`,
			username: `${username}`,
			email: `${email}`,
			avatarColor: `${avatarColor}`,
			createAt: `${createdAt}`,
			blocked: JSON.stringify(blocked),
			blockedBy: JSON.stringify(blockedBy),
			postsCount: `${postsCount}`,
			followersCount: `${followersCount}`,
			followingCount: `${followingCount}`,
			notificacions: JSON.stringify(notificacions),
			work: `${work}`,
			location: `${location}`,
			school: `${school}`,
			quote: `${quote}`,
			social: JSON.stringify(social),
			bgImageId: `${bgImageId}`,
			bgImageVersion: `${bgImageVersion}`
		};

		try {
			if (!this.client.isOpen) {
				await this.client.connect();
			}
			await this.client.ZADD('user', { score: parseInt(userUid, 10), value: `${key}` });
			for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
				//await this.client.HSET(`users:${key}`, { [itemKey]: itemValue });
				await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
			}
		} catch (err) {
			log.error(err);
			throw new ServerError('Server Redis error. Try again');
		}
	}

	public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
		try {
			if (!this.client.isOpen) {
				await this.client.connect();
			}
			//recuperando los valores orignales para el response
			const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
			response.createAt = new Date(Generators.parseJson(`${response.createAt}`));
			response.postsCount = Generators.parseJson(`${response.postsCount}`);
			response.blocked = Generators.parseJson(`${response.blocked}`);
			response.blockedBy = Generators.parseJson(`${response.blockedBy}`);
			response.notificacions = Generators.parseJson(`${response.notificacions}`);
			response.social = Generators.parseJson(`${response.social}`);
			response.followersCount = Generators.parseJson(`${response.followersCount}`);
			response.followingCount = Generators.parseJson(`${response.followingCount}`);
			response.bgImageId = Generators.parseJson(`${response.bgImageId}`);
			response.bgImageVersion = Generators.parseJson(`${response.bgImageVersion}`);
			response.profilePicture = Generators.parseJson(`${response.profilePicture}`);
			response.location = Generators.parseJson(`${response.location}`);
			response.school = Generators.parseJson(`${response.school}`);
			response.quote = Generators.parseJson(`${response.quote}`);

			return response;
		} catch (error) {
			log.error(error);
			throw new ServerError('Server Redis error. Try again');
		}
	}
}
