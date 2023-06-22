import { Application, json, urlencoded, Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import cookieSession from 'cookie-session';
import Logger from 'bunyan';
import 'express-async-errors';
import HTTP_STATUS from 'http-status-codes';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { config } from '@configs/configEnvs';
import { logger } from '@configs/configLogs';
import { CustomError } from '@helpers/errors/customError';
import { IErrorResponse } from '@helpers/errors/errorResponse.interface';
import applicationRoutes from '@interfaces/http/routes';

//const SERVER_PORT = 5000; //se puede declarar aqui o en .env o en startHttp

const log: Logger = logger.createLogger('setupServer');

export class ChatServer {
	private app: Application;

	constructor(app: Application) {
		this.app = app;
	}

	public start(): void {
		this.securityMiddleware(this.app);
		this.standardMiddleware(this.app);
		this.routesMiddleware(this.app);
		this.globalErrorHandler(this.app);
		this.startServer(this.app);
	}

	private securityMiddleware(app: Application): void {
		app.use(
			cookieSession({
				name: 'session',
				keys: [config.SECRET_KEY_ONE!, config.SECRET_KEY_TWO!],
				maxAge: 24 * 7 * 3600000, //24 dias
				secure: config.NODE_ENV !== 'development'
			})
		);
		//para la proteccion de datos cuando viajen
		app.use(hpp());
		app.use(helmet());
		//para la comunicacion entre dominios
		app.use(
			cors({
				origin: config.CLIENT_URL, //'*' con esto permite habilitar el server a cualquier cliente
				credentials: true, //config obligatoria para produccion
				optionsSuccessStatus: 200,
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
			})
		);
	}

	private standardMiddleware(app: Application): void {
		app.use(compression());
		app.use(json({ limit: '50mb' }));
		app.use(urlencoded({ extended: true, limit: '50mb' }));
	}

	private routesMiddleware(app: Application): void {
		applicationRoutes(app);
	}

	private globalErrorHandler(app: Application): void {
		// para todas las rutas que no existan
		app.all('*', (req: Request, res: Response) => {
			res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
		});
		// para las rutas que si existan
		app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
			log.error(error);
			if (error instanceof CustomError) {
				return res.status(error.statusCode).json(error.serializeErrors());
			}
			next();
		});
	}

	private async startServer(app: Application): Promise<void> {
		try {
			//server de express
			const httpServer: http.Server = new http.Server(app);
			//server de socket
			const socketIO: Server = await this.createSocketIO(httpServer);
			this.startHttpServer(httpServer); //levantando el server de express
			this.socketIOConnections(socketIO); //para saber que esta arriba sockets
		} catch (error) {
			log.error(error);
		}
	}

	private startHttpServer(httpServer: http.Server): void {
		log.info(`Server has started with the process ${process.pid}`);
		//const SERVER_PORT = 5000;
		httpServer.listen(config.SERVER_PORT, () => {
			log.info(`Server running at ${config.SERVER_PORT}`);
		});
	}

	// crear servidor de sockets, en tiempo real
	private async createSocketIO(httpServer: http.Server): Promise<Server> {
		//se crea el server conectado con el de express
		const io: Server = new Server(httpServer, {
			cors: {
				origin: config.CLIENT_URL,
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
			}
		});
		//pub -> publisher se conecta con el serve de redis
		const pubClient = createClient({ url: config.REDIS_HOST });
		const subClient = pubClient.duplicate();
		await Promise.all([pubClient.connect(), subClient.connect()]);
		//el adapter recibe las configuraciones del pub y el sub
		io.adapter(createAdapter(pubClient, subClient));
		return io;
	}

	//para saber si esta conectado el servicio
	private socketIOConnections(io: Server): void {
		console.log(io);
		log.info('SocketIO Connections Ok.');
	}
}
