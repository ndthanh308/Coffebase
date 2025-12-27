import { ProductModel } from '../../domain-layer/models/product-model.js';

export class MenuService {
  /**
   * UCU01: Get Menu
   * Business Rules: Out-of-stock items marked unavailable but still displayed
   * Performance: Load within 2-4 seconds
   */
  async getMenu(category = null, search = null) {
    const products = await ProductModel.findAll({ category, search });
    return products;
  }

  /**
   * UCU01: Get Product by ID
   */
  async getProductById(productId) {
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  /**
   * UCU04: Search & Filter
   * Business Rules: Results must return within 2.5 seconds
   */
  async searchAndFilter({ query, category, minPrice, maxPrice, sortBy }) {
    const filters = {
      query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      sortBy: sortBy || 'name'
    };

    const products = await ProductModel.searchAndFilter(filters);
    return products;
  }

  /**
   * UCU05: Customize Drink
   * Business Rules: Prevent incompatible options, auto-calculate final price
   */
  calculateCustomizedPrice(basePrice, size, toppings = []) {
    let finalPrice = basePrice;

    // Size pricing
    const sizeMultipliers = { S: 1.0, M: 1.2, L: 1.5 };
    finalPrice *= sizeMultipliers[size] || 1.0;

    // Topping pricing
    toppings.forEach(topping => {
      finalPrice += topping.price || 0;
    });

    return Math.round(finalPrice);
  }

  /**
   * UCA2: Create Product (Admin only)
   * Business Rules: Price must be number, required fields cannot be empty
   */
  async createProduct(productData) {
    // Validate required fields
    if (!productData.name || !productData.price) {
      throw new Error('Name and price are required');
    }

    // Validate price is number
    if (isNaN(parseFloat(productData.price))) {
      throw new Error('Price must be a valid number');
    }

    const product = await ProductModel.create(productData);
    return product;
  }

  /**
   * UCA2: Update Product (Admin only)
   */
  async updateProduct(productId, productData) {
    // Validate price if provided
    if (productData.price && isNaN(parseFloat(productData.price))) {
      throw new Error('Price must be a valid number');
    }

    const product = await ProductModel.update(productId, productData);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }

  /**
   * UCA2: Delete Product (Admin only)
   */
  async deleteProduct(productId) {
    const deleted = await ProductModel.delete(productId);
    if (!deleted) {
      throw new Error('Product not found');
    }
    return { message: 'Product deleted successfully' };
  }
}

