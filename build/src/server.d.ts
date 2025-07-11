import { Application } from 'express';
export declare class GatewayServer {
    private app;
    constructor(app: Application);
    start(): void;
    private securityMiddleware;
    private standarMiddleware;
    private routesMiddleware;
    private errorHandlerMiddleware;
    private startServer;
    private startHttpServer;
}
