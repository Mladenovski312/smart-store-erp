/**
 * Client-side shopping cart using localStorage.
 * No auth required — any visitor can add to cart.
 */

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string;
    quantity: number;
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
        existing.quantity += quantity;
    } else {
        cart.push({ ...item, quantity });
    }
    writeCart(cart);
}

export function updateCartQuantity(productId: string, quantity: number): void {
    const cart = readCart();
    const item = cart.find(c => c.productId === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
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
