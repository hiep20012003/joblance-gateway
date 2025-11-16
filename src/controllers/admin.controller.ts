import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';
import {AdminService} from '@gateway/services/api/admin.service';

export class AdminController extends BaseController {
  private readonly adminService: AdminService;

  constructor(adminService: AdminService) {
    super();
    this.adminService = adminService;
  }

  public getAllUsers = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'get-all'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).getAllUsers();
      }
    );
  };

  public getUserById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'get-by-id'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).getUserById(req.params.userId);
      }
    );
  };

  public updateUserStatus = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'update-status'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).updateUserStatus(req.params.userId, req.body);
      }
    );
  };

  public updateUserVerifiedStatus = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'update-verified-status'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).updateUserVerifiedStatus(req.params.userId, req.body);
      }
    );
  };

  public deleteUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'delete'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).deleteUser(req.params.userId);
      }
    );
  };

  public createRole = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'role', 'create'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).createRole(req.body);
      }
    );
  };

  public getAllRoles = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'role', 'get-all'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).getAllRoles();
      }
    );
  };

  public getRoleById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'role', 'get-by-id'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).getRoleById(req.params.roleId);
      }
    );
  };

  public updateRole = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'role', 'update'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).updateRole(req.params.roleId, req.body);
      }
    );
  };

  public deleteRole = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'role', 'delete'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).deleteRole(req.params.roleId);
      }
    );
  };

  public assignRoleToUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'assign-role'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).assignRoleToUser(req.params.userId, req.body);
      }
    );
  };

  public unassignRoleFromUser = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'unassign-role'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).unassignRoleFromUser(req.params.userId, req.params.roleId);
      }
    );
  };

  public getUserRole = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('admin', 'user', 'get-roles'),
      async (forwardedHeader) => {

        return this.adminService.setHeader(forwardedHeader).getUserRole(req.params.userId);
      }
    );
  };
}
