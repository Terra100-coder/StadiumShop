import { Injectable, computed, signal } from '@angular/core';

import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'stadium-shop-cart';
  private readonly cartItems = signal<CartItem[]>(this.loadItems());

  readonly items = this.cartItems.asReadonly();
  readonly totalQuantity = computed(() => this.items().reduce((total, item) => total + item.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((total, item) => total + item.price * item.quantity, 0));
  readonly isEmpty = computed(() => this.items().length === 0);

  addItem(item: CartItem): boolean {
    const normalizedItem = this.normalizeItem(item);

    if (!normalizedItem) {
      return false;
    }

    const items = this.items();
    const existingIndex = items.findIndex((currentItem) => this.isSameLine(currentItem, normalizedItem));

    if (existingIndex === -1) {
      this.setItems([...items, normalizedItem]);
      return true;
    }

    const existingItem = items[existingIndex];
    const maxQuantity = Math.min(existingItem.maxQuantity, normalizedItem.maxQuantity);
    const updatedItem: CartItem = {
      ...existingItem,
      maxQuantity,
      quantity: Math.min(existingItem.quantity + normalizedItem.quantity, maxQuantity),
    };

    this.setItems(items.map((currentItem, index) => index === existingIndex ? updatedItem : currentItem));
    return true;
  }

  updateQuantity(item: CartItem, quantity: number): void {
    const nextQuantity = this.toPositiveInteger(quantity);

    if (nextQuantity === null) {
      return;
    }

    this.setItems(this.items().map((currentItem) => {
      if (!this.isSameLine(currentItem, item)) {
        return currentItem;
      }

      return {
        ...currentItem,
        quantity: Math.min(nextQuantity, currentItem.maxQuantity),
      };
    }));
  }

  removeItem(item: CartItem): void {
    this.setItems(this.items().filter((currentItem) => !this.isSameLine(currentItem, item)));
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.removeStoredItems();
  }

  private setItems(items: CartItem[]): void {
    this.cartItems.set(items);
    this.saveItems(items);
  }

  private isSameLine(first: CartItem, second: CartItem): boolean {
    return first.productId === second.productId &&
      first.size === second.size &&
      first.personalizationName === second.personalizationName &&
      first.personalizationNumber === second.personalizationNumber;
  }

  private loadItems(): CartItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const storedItems = localStorage.getItem(this.storageKey);

      if (!storedItems) {
        return [];
      }

      const parsedItems: unknown = JSON.parse(storedItems);
      if (!Array.isArray(parsedItems)) {
        return [];
      }

      return parsedItems
        .map((item) => this.normalizeItem(item))
        .filter((item): item is CartItem => item !== null);
    } catch {
      return [];
    }
  }

  private saveItems(items: CartItem[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private removeStoredItems(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  private normalizeItem(value: unknown): CartItem | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const item = value as Partial<CartItem>;
    const productId = item.productId;
    const quantity = this.toPositiveInteger(item.quantity);
    const maxQuantity = this.toPositiveInteger(item.maxQuantity);

    if (typeof productId !== 'number' ||
      !Number.isSafeInteger(productId) ||
      typeof item.name !== 'string' ||
      typeof item.image !== 'string' ||
      typeof item.size !== 'string' ||
      typeof item.price !== 'number' ||
      !Number.isFinite(item.price) ||
      (item.personalizationName !== null && typeof item.personalizationName !== 'string') ||
      (item.personalizationNumber !== null && typeof item.personalizationNumber !== 'string') ||
      quantity === null ||
      maxQuantity === null) {
      return null;
    }

    return {
      productId,
      name: item.name,
      image: item.image,
      size: item.size,
      quantity: Math.min(quantity, maxQuantity),
      price: item.price,
      personalizationName: item.personalizationName,
      personalizationNumber: item.personalizationNumber,
      maxQuantity,
    };
  }

  private toPositiveInteger(value: unknown): number | null {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
  }
}
