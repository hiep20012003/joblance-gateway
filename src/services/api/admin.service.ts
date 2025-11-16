import {AxiosService} from '@gateway/services/axios.service';

export class AdminService extends AxiosService {

  async getAllUsers() {
    return this.request('get', '/users');
  }

  async getUserById(userId: string) {
    return this.request('get', `/users/${userId}`);
  }

  async updateUserStatus(userId: string, requestData: unknown) {
    return this.request('put', `/users/${userId}/status`, requestData);
  }

  async updateUserVerifiedStatus(userId: string, requestData: unknown) {
    return this.request('put', `/users/${userId}/verify`, requestData);
  }

  async deleteUser(userId: string) {
    return this.request('delete', `/users/${userId}`);
  }

  async createRole(requestData: unknown) {
    return this.request('post', '/roles', requestData);
  }

  async getAllRoles() {
    return this.request('get', '/roles');
  }

  async getRoleById(roleId: string) {
    return this.request('get', `/roles/${roleId}`);
  }

  async updateRole(roleId: string, requestData: unknown) {
    return this.request('put', `/roles/${roleId}`, requestData);
  }

  async deleteRole(roleId: string) {
    return this.request('delete', `/roles/${roleId}`);
  }

  async assignRoleToUser(userId: string, requestData: unknown) {
    return this.request('post', `/users/${userId}/roles`, requestData);
  }

  async unassignRoleFromUser(userId: string, roleId: string) {
    return this.request('delete', `/users/${userId}/roles/${roleId}`);
  }

  async getUserRole(userId: string) {
    return this.request('get', `/users/${userId}/roles`);
  }
}
