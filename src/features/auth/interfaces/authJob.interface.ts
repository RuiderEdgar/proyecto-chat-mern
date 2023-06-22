import { IUserDocument } from '@user/interfaces/userDocument.interfaces';
import { IAuthDocument } from './authDocument.interface';

export interface IAuthJob {
	//procesos: workers
	value?: string | IAuthDocument | IUserDocument;
}
