/**
 * Product Data Transfer Object
 * Used for API request/response formatting
 */

export class ProductDTO {
  static toResponse(product) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.image_url,
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }

  static toRequest(body) {
    return {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price),
      category: body.category,
      imageUrl: body.imageUrl || body.image_url,
      isActive: body.isActive !== undefined ? body.isActive : true
    };
  }
}

