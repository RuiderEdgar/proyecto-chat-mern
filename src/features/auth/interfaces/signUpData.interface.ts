import { ObjectId } from 'mongodb';
export interface ISignUpData {
	_id: ObjectId;
	uId: string; //I
	email: string;
	username: string;
	password: string;
	avatarColor: string;
}
