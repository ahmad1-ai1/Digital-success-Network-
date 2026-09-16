import { devStore } from '../store/devStore';
import { Product } from '../types';

export const productService = {
  getProducts(): Product[] {
    return devStore.getData().products;
  },

  getAllProducts(): Product[] {
    return this.getProducts();
  },

  addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const product: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    devStore.save(data => {
      data.products.push(product);
    });

    return product;
  },

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    let updated: Product | null = null;
    devStore.save(data => {
      const idx = data.products.findIndex(p => p.id === id);
      if (idx >= 0) {
        data.products[idx] = {
          ...data.products[idx],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        updated = data.products[idx];
      }
    });
    return updated;
  },

  deleteProduct(id: string): boolean {
    let deleted = false;
    devStore.save(data => {
      const initialLen = data.products.length;
      data.products = data.products.filter(p => p.id !== id);
      deleted = data.products.length < initialLen;
    });
    return deleted;
  }
};
