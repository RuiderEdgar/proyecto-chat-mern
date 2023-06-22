import { Request, Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { config } from '@configs/configEnvs';
import { NotAuthorizedError } from '@helpers/errors/notAuthorizedError';
import { AuthPayLoad } from '@auth/interfaces/authPayLoad.interface';

export class AuthMiddleware {
	//verificar el usuario
	public verifyUser(req: Request, res: Response, next: NextFunction): void {
		//design pattern: STP synchronizer Token pattern
		if (!req.session?.jwt) {
			throw new NotAuthorizedError('Token is not availble, Please lofin again');
		}
		try {
			const payload: AuthPayLoad = JWT.verify(req.session?.jwt, config.JWT_TOKEN!) as AuthPayLoad;
			req.currentUser = payload;
		} catch (error) {
			throw new NotAuthorizedError('Token is invalida. Please login again');
		}
		next();
	}

	//verificar si tiene la autenticacion o el acceso a esa ruta
	public checkAuthentication(req: Request, res: Response, next: NextFunction): void {
		if (!req.currentUser) {
			throw new NotAuthorizedError('Authentication is required to acces this route');
		}
		next();
	}
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
