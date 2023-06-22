import { hash, compare } from 'bcryptjs';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { model, Model, Schema } from 'mongoose';
// import { config } from '@configs/configEnvs';

const authSchema: Schema = new Schema(
	{
		username: { type: 'String' },
		uId: { type: 'String' },
		email: { type: 'String' },
		password: { type: 'String' },
		avatarColor: { type: 'String' },
		createdAt: { type: Date, default: Date.now() },
		passwordResetToken: { type: String, default: '' },
		passwordResetExpires: { type: Number }
	},
	{
		toJSON: {
			//asi se borra del doc, la referencia del password para no exponerla
			transform(_doc, ret) {
				delete ret.password;
				return ret;
			}
		}
	}
);
// Design pattern AAA (authorization, authentication, auditory)
// virtual methods / space methods: metodos para la logica asociada al schema
//para generarlo

// authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
// 	//se hashea 10 veces segun el Salt_round
// 	const hashedPassword: string = await hash(this.password as string, Number(config.SALT_ROUND));
// 	this.password = hashedPassword;
// 	next();
// });

//para validarlo
authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	const hashedPassword: string = (this as IAuthDocument).password!;
	return compare(password, hashedPassword);
};

// authSchema.methods.hashPassword = async function (password: string): Promise<string> {
// 	return hash(password, Number(config.SALT_ROUND));
// };

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');

export { AuthModel };
