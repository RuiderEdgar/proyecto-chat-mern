//auth.interface.ts
//para hacer un custom de los metodos en este caso de req. que viene de Express, para hacer un req.currentUser()
declare global {
	namespace Express {
		interface Request {
			currentUser?: AuthPayLoad;
		}
	}
}

//respuesta con autenticacion
export interface AuthPayLoad {
	userId: string;
	uId: string;
	email: string;
	username: string;
	avatarColor: string;
	iat?: number; // expiracion time token
}
