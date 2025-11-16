import express, {Router} from 'express';
import {config} from '@gateway/config';
import {handleAsyncError} from '@hiep20012003/joblance-shared';
import {MessagesService} from '@gateway/services/api/messages.service';
import {MessagesController} from '@gateway/controllers/message.controller';
import multer from 'multer';
import {authNotRefreshMiddleware} from "@gateway/middlewares/auth-not-refresh.middleware";

export class MessageRoutes {
  private readonly messageController: MessagesController;
  public router: Router;

  constructor() {
    const messagesService = new MessagesService(`${config.CHATS_BASE_URL}/api/v1`);
    this.messageController = new MessagesController(messagesService);

    this.router = express.Router();
    this.routes();
  }

  routes = (): Router => {
    this.router.use((req, _res, next) => {
      req.audience = 'chats';
      next();
    });

    const upload = multer({storage: multer.memoryStorage()});

    this.router.post(
      '/conversations',
      upload.single('attachment'),
      authNotRefreshMiddleware,
      handleAsyncError(this.messageController.createConversation)
    );
    this.router.post(
      '/conversations/:conversationId/messages',
      upload.single('attachment'),
      authNotRefreshMiddleware,
      handleAsyncError(this.messageController.createMessage)
    );
    this.router.get(
      '/conversations/:conversationId',
      authNotRefreshMiddleware,
      handleAsyncError(this.messageController.getConversationById)
    );

    this.router.get(
      '/conversations',
      authNotRefreshMiddleware,
      handleAsyncError(this.messageController.getCurrentUserConversations)
    );

    this.router.post(
      '/conversations/:conversationId/read',
      authNotRefreshMiddleware,
      handleAsyncError(this.messageController.readConversationMessages)
    );

    this.router.get(
      '/conversations/:conversationId/messages',
      authNotRefreshMiddleware,
      handleAsyncError(this.messageController.getMessagesInConversation)
    );


    return this.router;
  };
}

export const messageRoutes: MessageRoutes = new MessageRoutes();
