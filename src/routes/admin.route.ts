import express, { Router } from 'express';
import { config } from '@gateway/config';
import { handleAsyncError } from '@hiep20012003/joblance-shared';

import { AdminController } from '../controllers/admin.controller';
import { AdminService } from '../services/api/admin.service';

export class AdminRoute {
  private readonly adminController: AdminController;
  public router: Router;

  constructor() {
    const adminService = new AdminService(`${config.AUTH_BASE_URL}/api/v1/admin`);
    this.adminController = new AdminController(adminService);
    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'auth';
      next();
    });

    // User Management
    this.router.get('/admin/users', handleAsyncError(this.adminController.getAllUsers));
    this.router.get('/admin/users/:userId', handleAsyncError(this.adminController.getUserById));
    this.router.put('/admin/users/:userId/status', handleAsyncError(this.adminController.updateUserStatus));
    this.router.put('/admin/users/:userId/verify', handleAsyncError(this.adminController.updateUserVerifiedStatus));
    this.router.delete('/admin/users/:userId', handleAsyncError(this.adminController.deleteUser));

    // Role Management
    this.router.post('/admin/roles', handleAsyncError(this.adminController.createRole));
    this.router.get('/admin/roles', handleAsyncError(this.adminController.getAllRoles));
    this.router.get('/admin/roles/:roleId', handleAsyncError(this.adminController.getRoleById));
    this.router.put('/admin/roles/:roleId', handleAsyncError(this.adminController.updateRole));
    this.router.delete('/admin/roles/:roleId', handleAsyncError(this.adminController.deleteRole));

    // User Role Management
    this.router.post('/admin/users/:userId/roles', handleAsyncError(this.adminController.assignRoleToUser));
    this.router.delete('/admin/users/:userId/roles/:roleId', handleAsyncError(this.adminController.unassignRoleFromUser));
    this.router.get('/admin/users/:userId/roles', handleAsyncError(this.adminController.getUserRole));

    return this.router;
  };
}

export const adminRoute: AdminRoute = new AdminRoute();
