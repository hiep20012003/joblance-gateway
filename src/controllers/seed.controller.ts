import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '@gateway/config';
import { AppLogger } from '@gateway/utils/logger';
import {
  IAuthDocument,
  IBuyerDocument,
  IGigDocument,
  ISellerDocument,
} from '@hiep20012003/joblance-shared';

interface SeedResponse {
  users?: IAuthDocument[];
  buyers?: IBuyerDocument[];
  sellers?: ISellerDocument[];
  gigs?: IGigDocument[];
  counts?: { orders: number };
  orders?: any[]; // để lấy completed orders
}

export const seedAllServices = async (req: Request, res: Response) => {
  const operation = 'seedAllServices';
  try {
    const usersCount = req.query.users ? parseInt(req.query.users as string, 10) : 50;
    const sellersCount = req.query.sellers ? parseInt(req.query.sellers as string, 10) : 10;
    const results: { service: string; status: number; total?: number; data?: unknown }[] = [];
    const seededServices: string[] = [];

    try {
      // 1. Seed Auth Users
      const authResponse = await axios.post<SeedResponse>(`${config.AUTH_BASE_URL}/seed/users?count=${usersCount}`);
      results.push({ service: 'auth', status: authResponse.status, total: authResponse.data.users?.length ?? 0 });
      AppLogger.info(`Auth service seeded ${usersCount} users`, { operation });
      seededServices.push('auth');

      // 2. Seed Buyers
      const buyersResponse = await axios.post<SeedResponse>(`${config.USERS_BASE_URL}/seed/buyers`, {
        users: authResponse.data.users,
      });
      results.push({
        service: 'users-buyers',
        status: buyersResponse.status,
        total: buyersResponse.data.buyers?.length ?? 0,
      });
      AppLogger.info(`Users service seeded ${buyersResponse.data.buyers?.length} buyers`, { operation });
      seededServices.push('users-buyers');

      // 3. Seed Sellers
      const sellersResponse = await axios.post<SeedResponse>(`${config.USERS_BASE_URL}/seed/sellers`, {
        buyers: buyersResponse.data.buyers?.slice(0, sellersCount),
      });
      results.push({
        service: 'users-sellers',
        status: sellersResponse.status,
        total: sellersResponse.data.sellers?.length ?? 0,
      });
      AppLogger.info(`Users service seeded ${sellersResponse.data.sellers?.length} sellers`, { operation });
      seededServices.push('users-sellers');

      // 4. Seed Gigs
      const gigsResponse = await axios.post<SeedResponse>(`${config.GIGS_BASE_URL}/seed/gigs`, {
        sellers: sellersResponse.data.sellers,
      });
      results.push({ service: 'gigs', status: gigsResponse.status, total: gigsResponse.data.gigs?.length ?? 0 });
      AppLogger.info(`Gigs service seeded ${gigsResponse.data.gigs?.length} gigs`, { operation });
      seededServices.push('gigs');

      // 5. Seed Orders
      const ordersResponse = await axios.post<SeedResponse>(`${config.ORDERS_BASE_URL}/seed/orders`, {
        buyers: buyersResponse.data.buyers,
        sellers: sellersResponse.data.sellers,
        gigs: gigsResponse.data.gigs,
      });
      const ordersCount = ordersResponse.data?.counts?.orders ?? 0;
      results.push({ service: 'orders', status: ordersResponse.status, total: ordersCount });
      AppLogger.info(`Orders service seeded ${ordersCount} orders`, { operation });
      seededServices.push('orders');

      // 6. NEW: Seed Reviews – chỉ các order COMPLETED có review
      const completedOrders = (ordersResponse.data?.orders ?? [])
        .filter((o: any) => o.status === 'COMPLETED' && (o.buyerReview || o.sellerReview))
        .map((o: any) => ({
          _id: o._id,
          gigId: o.gigId,
          buyerId: o.buyerId,
          buyerUsername: o.buyerUsername,
          buyerPicture: o.buyerPicture,
          sellerId: o.sellerId,
          sellerUsername: o.sellerUsername,
          sellerPicture: o.sellerPicture,
          buyerReview: o.buyerReview
            ? {
              _id: o.buyerReview._id,
              rating: o.buyerReview.rating,
              review: o.buyerReview.review,
              timestamp: o.buyerReview.timestamp,
            }
            : undefined,
          sellerReview: o.sellerReview
            ? {
              _id: o.sellerReview._id,
              rating: o.sellerReview.rating,
              review: o.sellerReview.review,
              timestamp: o.sellerReview.timestamp,
            }
            : undefined,
        }));

      if (completedOrders.length > 0) {
        const reviewsResponse = await axios.post(`${config.REVIEWS_BASE_URL}/seed/reviews`, {
          completedOrders,
        });
        const reviewsSeeded = reviewsResponse.data?.stats?.totalReviewsSeeded ?? 0;
        results.push({ service: 'reviews', status: reviewsResponse.status, total: reviewsSeeded });
        AppLogger.info(`Reviews service seeded ${reviewsSeeded} reviews (from ${completedOrders.length} completed orders)`, { operation });
        seededServices.push('reviews');
      } else {
        results.push({ service: 'reviews', status: 200, total: 0 });
        AppLogger.info('No completed orders with reviews → skipped reviews seeding', { operation });
      }

      return res.status(200).json({
        message: 'Seeding completed for ALL services (including Reviews)',
        results,
      });
    } catch (error: any) {
      AppLogger.error('Failed to seed services – starting rollback', { operation, error: error.message });

      // ROLLBACK IN REVERSE ORDER
      for (const service of seededServices.reverse()) {
        try {
          if (service === 'reviews') {
            await axios.delete(`${config.REVIEWS_BASE_URL}/seed/reviews`);
            AppLogger.info('Rolled back reviews', { operation });
          } else if (service === 'orders') {
            await axios.delete(`${config.ORDERS_BASE_URL}/seed/orders`);
            AppLogger.info('Rolled back orders', { operation });
          } else if (service === 'gigs') {
            await axios.delete(`${config.GIGS_BASE_URL}/seed/gigs`);
            AppLogger.info('Rolled back gigs', { operation });
          } else if (service === 'users-sellers') {
            await axios.delete(`${config.USERS_BASE_URL}/seed/sellers`);
            AppLogger.info('Rolled back sellers', { operation });
          } else if (service === 'users-buyers') {
            await axios.delete(`${config.USERS_BASE_URL}/seed/buyers`);
            AppLogger.info('Rolled back buyers', { operation });
          } else if (service === 'auth') {
            await axios.delete(`${config.AUTH_BASE_URL}/seed/users`);
            AppLogger.info('Rolled back auth users', { operation });
          }
        } catch (rollbackError: any) {
          AppLogger.error(`Rollback failed for ${service}`, { operation, error: rollbackError.message });
        }
      }

      return res.status(500).json({
        message: 'Seeding failed – rollback attempted',
        error: error.message,
        partialResults: results,
      });
    }
  } catch (error: any) {
    AppLogger.error('Unexpected error in seedAllServices', { operation, error: error.message });
    return res.status(500).json({ message: 'Unexpected error', error: error.message });
  }
};

export const deleteAllSeededData = async (_req: Request, res: Response) => {
  const operation = 'deleteAllSeededData';
  const results: { service: string; status: number; data?: unknown }[] = [];

  try {
    // 1. Reviews first (vì phụ thuộc vào orders)
    try {
      const reviewsRes = await axios.delete(`${config.REVIEWS_BASE_URL}/seed/reviews`);
      results.push({ service: 'reviews', status: reviewsRes.status, data: reviewsRes.data });
      AppLogger.info('Deleted seeded reviews', { operation });
    } catch (e) { /* ignore if not exist */
    }

    // 2. Orders
    try {
      const ordersRes = await axios.delete(`${config.ORDERS_BASE_URL}/seed/orders`);
      results.push({ service: 'orders', status: ordersRes.status, data: ordersRes.data });
      AppLogger.info('Deleted seeded orders', { operation });
    } catch (e) { /* ignore */
    }

    // 3. Gigs
    const gigsRes = await axios.delete(`${config.GIGS_BASE_URL}/seed/gigs`);
    results.push({ service: 'gigs', status: gigsRes.status, data: gigsRes.data });
    AppLogger.info('Deleted seeded gigs', { operation });

    // 4. Sellers
    const sellersRes = await axios.delete(`${config.USERS_BASE_URL}/seed/sellers`);
    results.push({ service: 'users-sellers', status: sellersRes.status, data: sellersRes.data });
    AppLogger.info('Deleted seeded sellers', { operation });

    // 5. Buyers
    const buyersRes = await axios.delete(`${config.USERS_BASE_URL}/seed/buyers`);
    results.push({ service: 'users-buyers', status: buyersRes.status, data: buyersRes.data });
    AppLogger.info('Deleted seeded buyers', { operation });

    // 6. Auth Users
    const authRes = await axios.delete(`${config.AUTH_BASE_URL}/seed/users`);
    results.push({ service: 'auth', status: authRes.status, data: authRes.data });
    AppLogger.info('Deleted seeded auth users', { operation });

    return res.status(200).json({
      message: 'All seeded data deleted successfully (including Reviews)',
      results,
    });
  } catch (error: any) {
    AppLogger.error('Failed to delete all seeded data', { operation, error: error.message });
    return res.status(500).json({
      message: 'Failed to delete all seeded data',
      error: error.message,
      partialResults: results,
    });
  }
};
