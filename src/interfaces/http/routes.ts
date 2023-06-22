import { Application } from 'express';
//authRoutes
import { authRoutes } from '@auth/routes/authRoutes';
import { serverAdapter } from '@services/queues/base.queue';
import { config } from '@configs/configEnvs';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@helpers/middlewares/auth-middleware';

//const BASE_PATH = '/api/v1';

export default (app: Application) => {
	const routes = () => {
		app.use('/queues', serverAdapter.getRouter());
		app.use(config.BASE_PATH!, authRoutes.routes());
		app.use(config.BASE_PATH!, authRoutes.signuotRoute());
		app.use(config.BASE_PATH!, authMiddleware.verifyUser, currentUserRoutes.routes());
	};
	routes();
};
