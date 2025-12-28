import { ReviewModel } from '../../domain-layer/models/review-model.js';

function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return 'Ẩn danh';
  const [local, domain] = email.split('@');
  if (!local) return `***@${domain || '***'}`;
  const keep = local.slice(0, Math.min(2, local.length));
  return `${keep}${local.length > 2 ? '***' : ''}@${domain || '***'}`;
}

export class ReviewService {
  async getProductReviews(productId) {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    const [reviews, ratings] = await Promise.all([
      ReviewModel.listByProductId({ productId, limit: 50, offset: 0, approvedOnly: true }),
      ReviewModel.listRatingsByProductId({ productId, approvedOnly: true })
    ]);

    const count = ratings.length;
    const average = count
      ? Math.round((ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0) / count) * 10) / 10
      : 0;

    const normalized = reviews.map((r) => {
      const userEmail = Array.isArray(r.users) ? r.users?.[0]?.email : r.users?.email;
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        reviewer: maskEmail(userEmail)
      };
    });

    return {
      stats: { count, average },
      reviews: normalized
    };
  }
}
