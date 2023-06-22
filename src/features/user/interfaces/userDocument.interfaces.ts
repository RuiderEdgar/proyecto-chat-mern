import mongoose, { Document, ObjectId } from 'mongoose';
import { INotificationSettings } from './notificationSettings.interface';
import { ISocialLinks } from './socialLinks.interface';

export interface IUserDocument extends Document {
	_id: string | ObjectId;
	authId: string | ObjectId;
	username?: string;
	email?: string;
	password?: string;
	avatarColor?: string;
	uId?: string;
	postsCount: number; //s
	work: string;
	school: string;
	quote: string;
	location: string;
	blocked: mongoose.Types.ObjectId[];
	blockedBy: mongoose.Types.ObjectId[];
	followersCount: number;
	followingCount: number;
	notificacions: INotificationSettings; //s
	social: ISocialLinks;
	bgImageVersion: string;
	bgImageId: string;
	profilePicture: string;
	createAt?: Date;
}
