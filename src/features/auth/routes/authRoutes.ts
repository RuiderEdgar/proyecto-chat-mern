import express, { Router } from 'express';
import { SignUp } from '@auth/controllers/signup';
import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';

class AuthRouters {
	private router: Router;

	constructor() {
		this.router = express.Router();
	}

	//Para autenticacion
	public routes(): Router {
		this.router.post('/signup', SignUp.prototype.create);
		this.router.post('/signin', SignIn.prototype.read);
		return this.router;
	}

	public signuotRoute(): Router {
		this.router.get('/signout', SignOut.prototype.update);
		return this.router;
	}
}

export const authRoutes: AuthRouters = new AuthRouters();
