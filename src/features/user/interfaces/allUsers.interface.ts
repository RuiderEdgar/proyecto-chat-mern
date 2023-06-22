import { IUserDocument } from './userDocument.interfaces';

export interface IAllUsers {
	user: IUserDocument[];
	totalUsers: number;
}
