import FormData from 'form-data';

import {AxiosService} from '../axios.service';

export class GigsService extends AxiosService {
  // ----------------------------
  // CREATE
  // ----------------------------
  async createGig(data: FormData) {
    return this.request('post', '/gigs', data);
  }

  // ----------------------------
  // READ / GET
  // ----------------------------
  async getGigById(gigId: string) {
    return this.request('get', `/gigs/${gigId}`);
  }

  async getTopGigs(query?: Record<string, unknown>) {
    return this.request('get', '/gigs/top', undefined, query);
  }

  async getGigsBySeller(username: string, query?: Record<string, unknown>) {
    return this.request('get', `/sellers/${username}/gigs`, undefined, query);
  }

  async getActiveGigsBySeller(username: string, query?: Record<string, unknown>) {
    return this.request('get', `/sellers/${username}/gigs/active`, undefined, query);
  }

  async getInactiveGigsBySeller(username: string, query?: Record<string, unknown>) {
    return this.request('get', `/sellers/${username}/gigs/inactive`, undefined, query);
  }

  async getGigsSimilar(gigId: string) {
    return this.request('get', `/gigs/${gigId}/similar`);
  }

  // ----------------------------
  // UPDATE
  // ----------------------------
  async updateGig(gigId: string, data: unknown) {
    return this.request('patch', `/gigs/${gigId}`, data);
  }

  async activeGig(gigId: string) {
    return this.request('patch', `/gigs/${gigId}/active`);
  }

  async inactiveGig(gigId: string) {
    return this.request('patch', `/gigs/${gigId}/inactive`);
  }

  // ----------------------------
  // DELETE
  // ----------------------------
  async deleteGig(gigId: string) {
    return this.request('delete', `/gigs/${gigId}`);
  }

  // ----------------------------
  // SEARCH
  // ----------------------------
  async search(payload: unknown) {
    return this.request('post', '/gigs/search', payload);
  }

  async searchGigById(gigId: string) {
    return this.request('get', `/gigs/search/${gigId}`);
  }
}
