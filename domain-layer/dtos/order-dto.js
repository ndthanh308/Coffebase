/**
 * Order Data Transfer Object
 * Used for API request/response formatting
 */

export class OrderDTO {
  static toResponse(order) {
    return {
      id: order.id,
      userId: order.user_id,
      items: order.items,
      deliveryInfo: order.delivery_info,
      total: order.total,
      paymentMethod: order.payment_method,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }

  static toRequest(body) {
    return {
      items: body.items,
      deliveryInfo: body.deliveryInfo,
      paymentMethod: body.paymentMethod
    };
  }
}

