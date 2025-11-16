import http from 'http';

import {Server, Socket} from 'socket.io';
import {config} from '@gateway/config';
import {io as ioClient, Socket as SocketClient} from 'socket.io-client';
import {AppLogger} from '@gateway/utils/logger';
import {cacheStore} from '@gateway/cache/redis.connection';
import {createAdapter} from '@socket.io/redis-adapter';

// Define custom properties on Socket (to store userId after authentication)
interface CustomSocket extends Socket {
  userId?: string;
}

// Heartbeat Timeout (Thời gian tối đa không có Heartbeat)
const HEARTBEAT_TIMEOUT = 60000; // 60 giây (1 phút)

export class SocketsIOHandler {
  private readonly io: Server;
  private readonly chatSocketClient: SocketClient;
  private readonly notificationSocketClient: SocketClient;

  // Map quản lý Timer Heartbeat cho mỗi userId
  private readonly heartbeatTimers: Map<string, NodeJS.Timeout> = new Map(); // Map<userId, timerId>

  // Map để quản lý Execution Queue cho từng userId, đảm bảo tuần tự hóa các thao tác Redis
  private readonly userActionQueues: Map<string, Promise<void>> = new Map(); // Map<userId, Promise>

  // Map quản lý Socket ID đã được liên kết với userId
  private readonly socketToUserIdMap: Map<string, string> = new Map(); // Map<socketId, userId>

  constructor(httpServer: http.Server) {
    /** Redis adapter (support for scaling horizontally) */
    const pubClient = cacheStore.getClient();
    const subClient = pubClient.duplicate();

    this.io = new Server(httpServer, {
      cors: {origin: '*', methods: ['GET', 'POST']},
      adapter: createAdapter(pubClient, subClient),
    });

    /** Chat microservice socket client */
    this.chatSocketClient = ioClient(`${config.CHATS_BASE_URL}/chats`, {
      transports: ['websocket', 'polling'],
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    /** Notification microservice socket client */
    this.notificationSocketClient = ioClient(`${config.NOTIFICATIONS_BASE_URL}/notifications`, {
      transports: ['websocket', 'polling'],
      secure: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });
  }

  /** ------------------------
   * Hàm hỗ trợ: Tuần tự hóa hành động Redis theo userId
   * ------------------------ */
  private async enqueueUserAction(userId: string, actionFn: () => Promise<void>): Promise<void> {
    const currentPromise = this.userActionQueues.get(userId) || Promise.resolve();

    const newPromise = currentPromise
      .catch((error) => {
        AppLogger.error(`Error in previous queued action for user ${userId}:`, {error});
      })
      .then(actionFn);

    this.userActionQueues.set(userId, newPromise);

    await newPromise.finally(() => {
      if (this.userActionQueues.get(userId) === newPromise) {
        this.userActionQueues.delete(userId);
      }
    });
  }

  /** ------------------------
   * Hàm xử lý OFFLINE khi Heartbeat hết hạn
   * (Chỉ cập nhật Last Active tại đây)
   * ------------------------ */
  private async processOffline(userId: string): Promise<void> {
    await this.enqueueUserAction(userId, async () => {
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
      const presenceNamespace = this.io.of('/presence');

      // Xóa Timer Heartbeat
      this.heartbeatTimers.delete(userId);

      // Kiểm tra trạng thái cuối cùng (Sử dụng Redis SET cũ)
      const isCurrentlyOnline = await cacheStore.checkUserOnlineStatus('loggedInUsers', userId);

      if (!isCurrentlyOnline) {
        AppLogger.info(`User ${userId} already OFFLINE. Skipping.`, {operation: 'gateway:client-presence:offline-skip'});
        return;
      }

      // --- LOGIC OFFLINE THỰC SỰ ---

      // 1. Xóa khỏi Redis SET (ONLINE)
      await cacheStore.removeLoggedInUserFromCache('loggedInUsers', userId);

      // 2. CẬP NHẬT Last Active (ZSET) - CHỈ KHI OFFLINE
      await cacheStore.updateUserLastActive(userId, currentTimestampInSeconds);

      // Broadcast OFFLINE
      const update = {userId, status: 'offline', timestamp: currentTimestampInSeconds};
      presenceNamespace.to(`broadcast:${userId}`).emit('presence:status:change', update);

      AppLogger.info(`User ${userId} confirmed OFFLINE after 1-minute timeout. Last Active updated.`, {
        operation: 'gateway:client-presence',
      });
    });
  }

  /** ------------------------
   * Khởi động hoặc reset Timer Heartbeat 1 phút
   * ------------------------ */
  private resetHeartbeatTimer(userId: string): void {
    if (this.heartbeatTimers.has(userId)) {
      // Hủy Timer cũ (kéo dài thời gian sống online thêm 1 phút nữa)
      clearTimeout(this.heartbeatTimers.get(userId));
      this.heartbeatTimers.delete(userId);
      AppLogger.info(`Heartbeat timer reset for user ${userId}.`, {operation: 'gateway:heartbeat-reset'});
    }

    // Đặt Timer mới 1 phút
    const timer = setTimeout(() => {
      // Sau 1 phút không có Heartbeat mới, đánh dấu OFFLINE
      void this.processOffline(userId);
    }, HEARTBEAT_TIMEOUT);

    this.heartbeatTimers.set(userId, timer);
  }

  /** ------------------------
   * Logic Heartbeat (Join hoặc Keep-Alive)
   * (KHÔNG CẬP NHẬT LAST ACTIVE)
   * ------------------------ */
  private async handleHeartbeat(userId: string): Promise<void> {
    await this.enqueueUserAction(userId, async () => {
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
      const presenceNamespace = this.io.of('/presence');

      // Kiểm tra trạng thái cũ (dựa trên Redis SET cũ)
      const wasOffline = !(await cacheStore.checkUserOnlineStatus('loggedInUsers', userId));
      await cacheStore.saveLoggedInUserToCache('loggedInUsers', userId);

      // KHÔNG CẬP NHẬT LAST ACTIVE TẠI ĐÂY THEO YÊU CẦU

      if (wasOffline) {
        // Chuyển từ OFFLINE -> ONLINE
        // 1. Thêm user vào Redis SET (ONLINE)

        // Broadcast ONLINE
        const update = {userId, status: 'online', timestamp: currentTimestampInSeconds};
        presenceNamespace.to(`broadcast:${userId}`).emit('presence:status:change', update);
        AppLogger.info(`User ${userId} broadcasted ONLINE status.`, {operation: 'gateway:client-presence'});
      }

      // Luôn reset/set Timer Heartbeat (1 phút)
      this.resetHeartbeatTimer(userId);
    });
  }

  /** ------------------------
   * Entry point
   * ------------------------ */
  public listen(): void {
    this.handleChatsServiceConnection();
    this.handleNotificationServiceConnection();
    this.handleClientConnections();
  }

  /** ------------------------
   * Gateway ↔ Chat Microservice
   * ------------------------ */
  private handleChatsServiceConnection(): void {
    const client = this.chatSocketClient;
    client.on('connect', () => {
      AppLogger.info('ChatsService connected', {operation: 'gateway:chat-client'});
    });
    client.on('message:send', (conversationId: string, data) => {
      this.io.of('/chats').to(`chat:${conversationId}`).emit('message:send', data);
    });
    client.on('message:read', (conversationId: string, data) => {
      this.io.of('/chats').to(`chat:${conversationId}`).emit('message:read', data);
    });
  }

  /** ------------------------
   * Gateway ↔ Notification Microservice
   * ------------------------ */
  private handleNotificationServiceConnection(): void {
    const client = this.notificationSocketClient;
    client.on('connect', () => {
      AppLogger.info('NotificationsService connected', {operation: 'gateway:notification-client'});
    });
    client.on('notification:new', (recipientId: string, data) => {
      this.io.of('/notifications').to(`notifications:${recipientId}`).emit('notification:new', data);
    });
    client.on('chat:alert', (recipientId: string, data) => {
      this.io.of('/notifications').to(`notifications:${recipientId}`).emit('chat:alert', data);
    });
    client.on('chat:list_update', (recipientId: string, data) => {
      this.io.of('/notifications').to(`notifications:${recipientId}`).emit('chat:list_update', data);
    });
    client.on('conversation:read', (recipientId: string, data) => {
      this.io.of('/notifications').to(`notifications:${recipientId}`).emit('conversation:read', data);
    });
  }


  /** ------------------------
   * Client ↔ Gateway connections
   * ------------------------ */
  private handleClientConnections(): void {

    // **********************************************
    // Namespace: /chats
    // **********************************************
    const chatsNamespace = this.io.of('/chats');
    chatsNamespace.on('connection', (socket: CustomSocket) => {
      AppLogger.info(`Client connected to /chats: ${socket.id}`, {operation: 'gateway:client-chat'});

      socket.on('chat:authenticate', (userId: string) => {
        socket.userId = userId;
      });

      socket.on('chat:join', async (conversationId: string) => {
        const userId = socket.userId;
        if (userId) {
          for (const room of socket.rooms) {
            if (room.startsWith('chat:')) {
              await socket.leave(room);
            }
          }

          await socket.join(`chat:${conversationId}`);
          await cacheStore.setEx(`user:current_room:${userId}`, 3600, conversationId);
          AppLogger.info(`User ${userId} joined chat room: ${conversationId}`, {operation: 'gateway:client-chat'});
        }
      });

      socket.on('chat:leave', async (conversationId: string) => {
        if (socket.userId) {
          await socket.leave(`chat:${conversationId}`);
          await cacheStore.setEx(`user:current_room:${socket.userId}`, 60, 'none'); // Short TTL for handling reconnects
          AppLogger.info(`User ${socket.userId} left chat room: ${conversationId}`, {operation: 'gateway:client-chat'});
        }
      });

      socket.on('disconnect', async () => {
        if (socket.userId) {
          await cacheStore.setEx(`user:current_room:${socket.userId}`, 60, 'none'); // Signal temporary absence
        }
      });
    });

    // **********************************************
    // Namespace: /notifications
    // **********************************************
    const notificationsNamespace = this.io.of('/notifications');
    notificationsNamespace.on('connection', (socket: CustomSocket) => {
      AppLogger.info(`Client connected to /notifications: ${socket.id}`, {operation: 'gateway:client-notification'});

      socket.on('notifications:join', async (userId: string) => {
        socket.userId = userId;
        await socket.join(`notifications:${userId}`);
        AppLogger.info(`User ${userId} joined notifications room.`, {operation: 'gateway:client-notification'});
      });

      socket.on('notifications:leave', async (userId: string) => {
        await socket.leave(`notifications:${userId}`);
      });

      socket.on('disconnect', () => { /* ... */
      });
    });


    // **********************************************
    // Namespace: /presence (PRESENCE TRACKING - HEARTBEAT 1 MINUTE)
    // **********************************************
    const presenceNamespace = this.io.of('/presence');
    presenceNamespace.on('connection', (socket: CustomSocket) => {
      AppLogger.info(`Client connected to /presence: ${socket.id}`, {operation: 'gateway:client-presence'});

      // 1. Authenticate user and set ONLINE status
      socket.on('presence:join', async (userId: string) => {
        socket.userId = userId;
        this.socketToUserIdMap.set(socket.id, userId);
        await this.handleHeartbeat(userId);
      });

      // 2. Heartbeat/Keep-Alive Handler (Reset 1 phút Timer)
      socket.on('presence:heartbeat', async (userId: string) => {
        await this.handleHeartbeat(userId);
      });

      // Topic-Based Fan-out Subscription (Giữ nguyên)
      socket.on('presence:subscribe', async (friendIds: string[]) => {
        if (!socket.userId) {
          AppLogger.warn('Cannot watch presence without user ID.', {operation: 'gateway:client-presence'});
          return;
        }
        const roomsToJoin = friendIds.filter(id => !socket.rooms.has(`broadcast:${id}`)).map(id => `broadcast:${id}`);
        await socket.join(roomsToJoin);
        AppLogger.info(`User ${socket.userId} joined ${roomsToJoin.length} presence broadcast topics.`, {operation: 'gateway:client-presence:watch'});
      });

      socket.on('presence:unsubscribe', async (friendIds: string[]) => {
        if (!socket.userId) {
          AppLogger.warn('Cannot watch presence without user ID.', {operation: 'gateway:client-presence'});
          return;
        }
        for (const id of friendIds) {
          const topic = `broadcast:${id}`;
          if (socket.rooms.has(topic)) {
            await socket.leave(topic);
            socket.rooms.delete(topic);
          }
        }
        AppLogger.info(`User ${socket.userId} unsubscribed from ${friendIds.length} topics.`, {
          operation: 'gateway:client-presence:unsubscribe'
        });
      });

      // 3. Status Sync Handler (Vẫn dùng Redis SET/ZSET cũ)
      socket.on('presence:get_status', async (userIds: string[]) => {
        if (!socket.userId) {
          AppLogger.warn('Cannot get status batch without user ID.', {operation: 'gateway:client-presence:initial-sync'});
          return;
        }

        try {
          // SỬ DỤNG LOGIC CŨ: checkUsersOnlineStatus dựa trên Redis SET
          const onlineStatusArray = await cacheStore.checkUsersOnlineStatus('loggedInUsers', userIds);
          if (!onlineStatusArray) {
            AppLogger.warn('Failed to fetch online status array.', {operation: 'gateway:client-presence:initial-sync'});
            return;
          }

          const statusUpdates = [];

          for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            const isOnline = onlineStatusArray[i];
            let lastActiveTimestamp: number | undefined = undefined;

            // Luôn lấy Last Active từ ZSET
            lastActiveTimestamp = await cacheStore.getUserLastActivity(userId);

            statusUpdates.push({
              userId: userId,
              status: isOnline ? 'online' : 'offline',
              lastActive: lastActiveTimestamp, // Giây
            });
          }

          // 3. Trả kết quả về trực tiếp cho Client yêu cầu
          socket.emit('presence:status', statusUpdates);

          AppLogger.info(`Sent initial batch status (${userIds.length} users) to ${socket.userId}`, {
            operation: 'gateway:client-presence:initial-sync',
          });
        } catch (error) {
          AppLogger.error(`Error processing initial status batch for ${socket.userId}`, {
            operation: 'gateway:client-presence:initial-sync-error',
            error
          });
        }
      });


      // Get currently logged-in users (Vẫn dùng Redis SET cũ)
      socket.on('getLoggedInUsers', async () => {
        const response: string[] = (await cacheStore.getLoggedInUsersFromCache('loggedInUsers')) ?? [];
        presenceNamespace.emit('online', response);
      });

      // 4. Handle Disconnect (Dựa vào Timer 1 phút)
      socket.on('disconnect', (reason) => {
        const userId = socket.userId || this.socketToUserIdMap.get(socket.id);

        if (userId) {
          this.socketToUserIdMap.delete(socket.id);

          AppLogger.warn(`Client disconnected from /presence: ${socket.id}, User: ${userId}. Relying on existing 1-minute Heartbeat Timer to determine OFFLINE status.`, {
            operation: 'gateway:client-presence',
            context: {reason}
          });

        } else {
          AppLogger.info(`Client disconnected from /presence: ${socket.id}`, {
            operation: 'gateway:client-presence',
            context: {reason}
          });
        }
      });
    });

    // **********************************************
    // Default namespace
    // **********************************************
    this.io.on('connection', (socket: CustomSocket) => {
      AppLogger.info(`Client connected to default namespace: ${socket.id}`, {operation: 'gateway:client-default'});

      socket.on('authenticate', (userId: string) => {
        socket.userId = userId;
      });

      socket.on('disconnect', () => { /* ... */
      });
    });
  }

  /** ------------------------
   * Get Socket.IO instance
   * ------------------------ */
  public getSocketIO(): Server {
    return this.io;
  }
}
