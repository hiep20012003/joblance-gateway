import {config} from '@gateway/config';
import {AppLogger} from '@gateway/utils/logger';
import {RedisClient} from '@hiep20012003/joblance-shared';

// Redis key for Sorted Set (ZSET) storing last active timestamps
const LAST_ACTIVE_ZSET_KEY = 'user:last-active:zset';
// 30 days in seconds for cleanup threshold
const CLEANUP_THRESHOLD_SECONDS = 30 * 24 * 60 * 60;

export class CacheStore extends RedisClient {

  // --- PRESENCE TRACKING (Redis SET) ---

  /** * Get All Logged-In Users from a Redis Set (SMEMBERS)
   */
  getLoggedInUsersFromCache = async (key: string): Promise<string[] | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }
      const response: string[] = await this.client.smembers(key);
      AppLogger.info(`Fetched logged-in users: ${response.length}`, {
        operation: 'gateway:presence-cache',
      });
      return response;
    } catch (error) {
      AppLogger.error(`Error fetching logged-in users`, {
        operation: 'gateway:presence-cache',
        error
      });
      return undefined;
    }
  };

  /** * Add a User ID to a Redis Set (SADD)
   */
  saveLoggedInUserToCache = async (key: string, value: string): Promise<string[] | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      const added: number = await this.client.sadd(key, value);
      AppLogger.info(`User added/already in cache: ${value}. Added: ${added}`, {
        operation: 'gateway:presence-cache',
      });

      const response: string[] = await this.client.smembers(key);
      return response;
    } catch (error) {
      AppLogger.error(`Error saving user to logged-in cache`, {
        operation: 'gateway:presence-cache',
        error
      });
      return undefined;
    }
  };

  /** * Remove a User ID from a Redis Set (SREM)
   */
  removeLoggedInUserFromCache = async (key: string, value: string): Promise<string[] | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }
      await this.client.srem(key, value);
      AppLogger.info(`User removed from cache: ${value}`, {
        operation: 'gateway:presence-cache',
      });

      const response: string[] = await this.client.smembers(key);
      return response;
    } catch (error) {
      AppLogger.error(`Error removing user from logged-in cache`, {
        operation: 'gateway:presence-cache',
        error
      });
      return undefined;
    }
  };

  /** * Check if multiple User IDs are present in the Redis Set (SMISMEMBER).
   * @param key The Redis Set key (e.g., 'loggedInUsers').
   * @param userIds Array of User IDs to check.
   * @returns Array of booleans (true if online, false if offline), corresponding to the input order.
   * Time Complexity: O(N), where N is the number of members being checked.
   */
  checkUsersOnlineStatus = async (key: string, userIds: string[]): Promise<boolean[] | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      // SMISMEMBER key member1 member2 ...
      const results: number[] = await this.client.smismember(key, userIds);

      // Chuyển đổi mảng số nguyên (0/1) sang mảng boolean (false/true)
      const onlineStatus: boolean[] = results.map(status => status === 1);

      AppLogger.info(`Checked online status for ${userIds.length} users.`, {
        operation: 'gateway:presence-check',
      });
      return onlineStatus;
    } catch (error) {
      AppLogger.error(`Error checking users online status`, {
        operation: 'gateway:presence-check',
        error
      });
      return undefined;
    }
  };

  /** * Check if a single User ID is present in the Redis Set (SISMEMBER).
   * @param key The Redis Set key (e.g., 'loggedInUsers').
   * @param userId User ID to check.
   * @returns Boolean (true if online, false if offline).
   * Time Complexity: O(1)
   */
  checkUserOnlineStatus = async (key: string, userId: string): Promise<boolean> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      // SISMEMBER key member
      const result: number = await this.client.sismember(key, userId);

      AppLogger.info(`Checked single user online status for ${userId}: ${result === 1}`, {
        operation: 'gateway:presence-check-single',
      });
      return result === 1;
    } catch (error) {
      AppLogger.error(`Error checking single user online status`, {
        operation: 'gateway:presence-check-single',
        error
      });
      return false; // Trả về false an toàn nếu có lỗi
    }
  };

  // --- USER ACTIVITY TRACKING (Redis SORTED SET) ---

  /** * Update user's last activity timestamp (ZADD).
   * Score = Timestamp (seconds), Member = User ID.
   */
  updateUserLastActive = async (userId: string, timestamp: number): Promise<void> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }
      // Use ZADD: Score is timestamp, Member is userId
      await this.client.zadd(LAST_ACTIVE_ZSET_KEY, timestamp, userId);

      AppLogger.info(`Updated last active ZSET for ${userId}`, {
        operation: 'gateway:user-activity-zset',
      });
    } catch (error) {
      AppLogger.error(`Error updating last active ZSET for ${userId}`, {
        operation: 'gateway:user-activity-zset',
        error
      });
    }
  };

  /** * Get user's last activity timestamp (ZSCORE).
   * Returns Score (timestamp) for a Member (User ID).
   */
  getUserLastActivity = async (userId: string): Promise<number | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      const timestamp: string | null = await this.client.zscore(LAST_ACTIVE_ZSET_KEY, userId);

      AppLogger.info(`Fetched last active ZSET for ${userId}: ${timestamp}`, {
        operation: 'gateway:user-activity-zset',
      });

      return timestamp ? parseInt(timestamp, 10) : undefined;
    } catch (error) {
      AppLogger.error(`Error fetching last active ZSET for ${userId}`, {
        operation: 'gateway:user-activity-zset',
        error
      });
      return undefined;
    }
  };

  /** * Delete a specific user's activity record (ZREM).
   */
  deleteUserActivity = async (userId: string): Promise<void> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      // Use ZREM to remove the Member
      await this.client.zrem(LAST_ACTIVE_ZSET_KEY, userId);

      AppLogger.info(`Deleted activity ZSET for ${userId}`, {
        operation: 'gateway:user-activity-zset',
      });
    } catch (error) {
      AppLogger.error(`Error deleting activity ZSET for ${userId}`, {
        operation: 'gateway:user-activity-zset',
        error
      });
    }
  };

  /** * Clean up old activity data (ZREMRANGEBYSCORE).
   * Used for periodic maintenance (cron job).
   */
  cleanupOldUserActivity = async (): Promise<number | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      // Calculate the timestamp cutoff (e.g., now - 30 days)
      const cutoffTimestamp = Math.floor(Date.now() / 1000) - CLEANUP_THRESHOLD_SECONDS;

      // ZREMRANGEBYSCORE deletes members with scores between -inf and the cutoff
      const removedCount: number = await this.client.zremrangebyscore(
        LAST_ACTIVE_ZSET_KEY,
        '-inf',
        cutoffTimestamp.toString()
      );

      AppLogger.info(`Cleaned up ${removedCount} old activity records.`, {
        operation: 'gateway:user-activity-cleanup',
      });
      return removedCount;
    } catch (error) {
      AppLogger.error(`Error cleaning up old user activity`, {
        operation: 'gateway:user-activity-cleanup',
        error
      });
      return undefined;
    }
  };

  /** * Get all User IDs from the activity ZSET (ZRANGE).
   */
  getAllUserActivities = async (): Promise<string[] | undefined> => {
    try {
      if (this.client.status === 'end' || this.client.status === 'close') {
        this.connect();
      }

      // Get all Members (User IDs) from the ZSET
      const userIds: string[] = await this.client.zrange(LAST_ACTIVE_ZSET_KEY, 0, -1);

      AppLogger.info(`Fetched all user IDs from ZSET: ${userIds.length}`, {
        operation: 'gateway:user-activity-zset',
      });
      return userIds;
    } catch (error) {
      AppLogger.error(`Error fetching all user IDs from ZSET`, {
        operation: 'gateway:user-activity-zset',
        error
      });
      return undefined;
    }
  };
}

export const cacheStore = new CacheStore(config.REDIS_URL, AppLogger);
