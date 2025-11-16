import FormData from 'form-data';

import {AxiosService} from '../axios.service';

export class MessagesService extends AxiosService {
  async createConversation(formData: unknown) {
    return this.request('post', `/conversations`, formData);
  }

  async createMessage(conversationId: string, data: FormData) {
    return this.request('post', `/conversations/${conversationId}/messages`, data);
  }

  async getConversationById(conversationId: string) {
    return this.request('get', `/conversations/${conversationId}`);
  }

  async getCurrentUserConversations(query: Record<string, unknown>) {
    return this.request('get', `/conversations`, undefined, query);
  }

  async readConversationMessages(conversationId: string) {
    return this.request('post', `/conversations/${conversationId}/read`);
  }

  async getMessagesInConversation(conversationId: string, query: Record<string, unknown>) {
    return this.request('get', `/conversations/${conversationId}/messages`, undefined, query);
  }


}
