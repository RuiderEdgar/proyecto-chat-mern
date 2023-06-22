import { IUserDocument } from '@user/interfaces/userDocument.interfaces';
import { UserModel } from '@user/models/user.schema';
import mongoose from 'mongoose';

class UserService {
	public async addUserData(data: IUserDocument): Promise<void> {
		await UserModel.create(data);
	}

	public async getUserById(userId: string): Promise<IUserDocument> {
		const users: IUserDocument[] = await UserModel.aggregate([
			{ $match: { _id: new mongoose.Types.ObjectId(userId) } },
			{ $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
			{ $unwind: '$authId' },
			{ $project: this.aggregateProject() }
		]);
		return users[0];
	}

	private aggregateProject() {
		return {
			_id: 1,
			username: '$authId.username',
			uId: '$authId.username',
			email: '$authId.email',
			avatarColor: '$authId.avatarColor',
			profilePicture: '$authId.profilePicture',
			followersCount: 1,
			followingCount: 1,
			postsCount: 1,
			bgImageVersion: 1,
			bgImageId: 1,
			createAt: '$authId.createAt',
			quote: '$authId.quote',
			location: '$authId.location',
			notifications: 1,
			social: 1,
			work: '$authId.work',
			school: '$authId.school',
			blocked: 1,
			blockedBy: 1
		};
	}
}

export const userService: UserService = new UserService();
