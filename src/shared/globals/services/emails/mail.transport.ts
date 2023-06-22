import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import sendGridMail from '@sendgrid/mail';
import Logger from 'bunyan';
import { logger } from '@configs/configLogs';
import { config } from '@configs/configEnvs';
import { BadRequestError } from '@helpers/errors/badRequestError';

interface IMailOptions {
	from: string;
	to: string;
	subject: string;
	html: string;
}

const log: Logger = logger.createLogger('mailOptions');
sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
	public async sendMail(receiverEmail: string, subject: string, body: string): Promise<void> {
		if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
			this.developmentEmailSender(receiverEmail, subject, body);
		} else {
			this.productionEmailSender(receiverEmail, subject, body);
		}
	}

	private async developmentEmailSender(receiverEmail: string, subject: string, body: string) {
		const transporter: Mail = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: config.SENDER_EMAIL,
				pass: config.SENDER_EMAIL_PASSWORD
			}
		});
		//si manda error de tls, agregar despues del auth:
		// tls: {
		// 	rejectUnauthorized: false
		// }

		const mailOptions: IMailOptions = {
			from: `Chat App <${config.SENDER_EMAIL}>`,
			to: receiverEmail,
			subject,
			html: body
		};

		try {
			await transporter.sendMail(mailOptions);
			log.info('Development email sent successfully');
		} catch (error) {
			log.error('Error sending email ', error);
			throw new BadRequestError('Error sending email');
		}
	}

	private async productionEmailSender(receiverEmail: string, subject: string, body: string) {
		const mailOptions: IMailOptions = {
			from: `Chat App <${config.SENDER_EMAIL}>`, //luego cambiarlo por credenciales de sengrid
			to: receiverEmail,
			subject,
			html: body
		};

		try {
			await sendGridMail.send(mailOptions);
			log.info('Production email sent successfully');
		} catch (error) {
			log.error('Error sending email ', error);
			throw new BadRequestError('Error sending email');
		}
	}
}

export const mailTransport: MailTransport = new MailTransport();
