import moment from 'moment';
import publicIp from 'ip';
import crypto from 'crypto';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { config } from '@configs/configEnvs';
import { authService } from '@services/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/authDocument.interface';
import { joiValidation } from '@decorators/joi-validation.decorators';
import { emailSchema, passwordSchema } from '@auth/schemes/emailAndpassword';
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template';
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template';
import { emailQueue } from '@services/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/resetPassword.interface';
import { BadRequestError } from '@helpers/errors/badRequestError';
import { Generators } from '@helpers/generators/generator';

export class Password {
	@joiValidation(emailSchema)
	public async create(req: Request, res: Response): Promise<void> {
		const { email } = req.body;
		const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
		if (!existingUser) {
			throw new BadRequestError('Invalid credentials');
		}

		//cryptografia
		const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
		const randomCharacters: string = randomBytes.toString('hex');
		await authService.updatePasswordToken(`${existingUser._id}`, randomCharacters, Date.now() * 60 * 60 * 1000);
		const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
		const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
		emailQueue.addEmailJob('forgotPasswordEmail', {
			template,
			receiverEmail: email,
			subject: 'Reset yourpassword'
		});
		res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent' });
	}

	@joiValidation(passwordSchema)
	public async update(req: Request, res: Response): Promise<void> {
		const { password, confirmPassword } = req.body;
		const passwordHash: string = await Generators.hash(password);
		const { token } = req.params;

		const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
		if (!existingUser) {
			throw new BadRequestError('Reset token has expired or invalid');
		}
		existingUser.password = passwordHash;
		existingUser.passwordResetExpires = undefined;
		existingUser.passwordResetToken = undefined;
		await existingUser.save();
		const templateParams: IResetPasswordParams = {
			username: existingUser.username,
			email: existingUser.email,
			ipaddress: publicIp.address(),
			date: moment().format('DD/MM/YYYY HH:mm')
		};

		const template: string = resetPasswordTemplate.passwordResetConfirmation(templateParams);
		emailQueue.addEmailJob('forgotPasswordEmail', {
			template,
			receiverEmail: existingUser.email,
			subject: 'Password Reset confirmation'
		});

		res.status(HTTP_STATUS.OK).json({ message: 'Password updated successfully' });
	}
}
