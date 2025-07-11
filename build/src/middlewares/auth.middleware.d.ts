import { NextFunction, Request, Response } from 'express';
declare class AuthMiddlerware {
    verifyUser(req: Request, _res: Response, next: NextFunction): void;
    checkAuthentication(req: Request, _res: Response, next: NextFunction): void;
}
export declare const authMiddlerware: AuthMiddlerware;
export {};
