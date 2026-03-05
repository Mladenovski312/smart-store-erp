/**
 * Client-side shopping cart using localStorage.
 * No auth required — any visitor can add to cart.
 */

import { createClient } from './supabase';

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string;
    quantity: number;
    stock: number;
}

const CART_KEY = 'jumbo_cart';

function readCart(): CartItem[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
}

function writeCart(items: CartItem[]) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    // Dispatch event so other components can react
    window.dispatchEvent(new Event('cart-updated'));
}

export function getCart(): CartItem[] {
    return readCart();
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    const cart = readCart();
    const existing = cart.find(c => c.productId === item.productId);
    if (existing) {
        // Cap at stock limit
        existing.quantity = Math.min(existing.quantity + quantity, existing.stock);
        // Also update stock if it changed in DB
        existing.stock = item.stock;
    } else {
        // Cap initial quantity at stock limit
        const cappedQuantity = Math.min(quantity, item.stock);
        cart.push({ ...item, quantity: cappedQuantity });
    }
    writeCart(cart);
    window.dispatchEvent(new Event('cart-item-added'));
}

export function updateCartQuantity(productId: string, quantity: number): void {
    const cart = readCart();
    const item = cart.find(c => c.productId === productId);
    if (item) {
        item.quantity = Math.min(Math.max(1, quantity), item.stock);
        writeCart(cart);
    }
}

export function removeFromCart(productId: string): void {
    const cart = readCart().filter(c => c.productId !== productId);
    writeCart(cart);
}

export function clearCart(): void {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cart-updated'));
}

export function getCartTotal(): number {
    return readCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(): number {
    return readCart().reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Syncs the local cart with the database to ensure stock limits are up-to-date.
 * If live stock is lower than in-cart quantity, it reduces the cart quantity.
 * If an item is completely out of stock, it removes it from the cart.
 */
export async function syncCartWithServer(): Promise<void> {
    if (typeof window === 'undefined') return;
    const cart = readCart();
    if (cart.length === 0) return;

    try {
        const supabase = createClient();
        const productIds = cart.map(c => c.productId);

        const { data, error } = await supabase
            .from('products')
            .select('id, stock_quantity')
            .in('id', productIds);

        if (error || !data) return;

        let changed = false;
        const newCart = cart.filter(item => {
            const dbProduct = data.find(p => p.id === item.productId);
            if (dbProduct) {
                const liveStock = dbProduct.stock_quantity;

                // Update local stock to match live stock
                if (item.stock !== liveStock) {
                    item.stock = liveStock;
                    changed = true;
                }

                // If it's completely out of stock now, remove it from cart
                if (liveStock === 0) {
                    changed = true;
                    return false;
                }

                // If they have more in cart than available, reduce to available
                if (item.quantity > liveStock) {
                    item.quantity = liveStock;
                    changed = true;
                }
                return true;
            }
            // If product is deleted from DB, remove it from cart
            changed = true;
            return false;
        });

        if (changed) {
            writeCart(newCart);
        }
    } catch (err) {
        console.error('Failed to sync cart:', err);
    }
}
