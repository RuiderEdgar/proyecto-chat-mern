import { IUserDocument } from './userDocument.interfaces';
import { INotificationSettings } from './notificationSettings.interface';

export interface IUserJob {
	keyOne?: string;
	keyTwo?: string;
	key?: string;
	value?: string | INotificationSettings | IUserDocument;
}
