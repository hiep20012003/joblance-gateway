import {Request, Response, NextFunction} from 'express';
import {BaseController} from '@gateway/controllers/base.controller';
import {MessagesService} from '@gateway/services/api/messages.service';
import {createFormData} from '@gateway/utils/helper';

export class MessagesController extends BaseController {
  constructor(private readonly messagesService: MessagesService) {
    super();
  }

  public createConversation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('messages', 'conversation', 'get'),
      async (forwardedHeader) => {
        const formData = createFormData(req);

        return this.messagesService.setHeader(forwardedHeader).createConversation(formData);
      }
    );
  };


  public createMessage = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('messages', 'messages', 'create'),
      async (forwardedHeader) => {
        const formData = createFormData(req);
        const {conversationId} = req.params;

        return this.messagesService.setHeader(forwardedHeader).createMessage(conversationId, formData);
      }
    );
  };


  public getConversationById = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('messages', 'conversation', 'get'),
      async (forwardedHeader) => {

        return this.messagesService.setHeader(forwardedHeader).getConversationById(req.params.conversationId);
      }
    );
  };

  public getCurrentUserConversations = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('messages', 'conversation', 'list'),
      async (forwardedHeader) => {

        return this.messagesService.setHeader(forwardedHeader).getCurrentUserConversations(req.query);
      }
    );
  };

  public readConversationMessages = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('messages', 'conversation', 'list'),
      async (forwardedHeader) => {

        return this.messagesService.setHeader(forwardedHeader).readConversationMessages(req.params.conversationId);
      }
    );
  };


  public getMessagesInConversation = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    await this.handleRequest(
      req,
      res,
      this.buildOperation('messages', 'messages', 'get-by-conversation-id'),
      async (forwardedHeader) => {

        const {conversationId} = req.params;
        return this.messagesService.setHeader(forwardedHeader).getMessagesInConversation(conversationId, req.query);
      }
    );
  };

}
