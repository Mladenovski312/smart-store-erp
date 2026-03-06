// Types for the Inter Star Jumbo POS system

export interface Product {
    id: string;
    slug: string;
    name: string;
    description?: string;
    category: string;
    imageUrl?: string;
    purchasePrice: number;
    sellingPrice: number;
    stockQuantity: number;
    barcode?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SaleRecord {
    id: string;
    productId: string;
    productName: string;
    quantitySold: number;
    soldPrice: number;
    profit: number;
    soldAt: string;
}

export interface DashboardStats {
    totalProducts: number;
    totalStockValue: number;
    todaySalesTotal: number;
    todaySalesCount: number;
}

export const CATEGORIES = [
    { value: 'Toys', label: 'Играчки' },
    { value: 'Vehicles & Ride-ons', label: 'Возила и Автомобили на батерии' },
    { value: 'Dolls & Figures', label: 'Кукли и Фигури' },
    { value: 'Baby & Toddler', label: 'Опрема за Бебиња' },
    { value: 'Outdoor & Sports', label: 'Спорт и Рекреација (Надвор)' },
    { value: 'Games & Puzzles', label: 'Игри и Сложувалки' },
    { value: 'Clothing & School', label: 'Облека и Училишен прибор' },
    { value: 'Разно (Miscellaneous)', label: 'Разно' },
] as const;

export function getCategoryLabel(value: string): string {
    return CATEGORIES.find(c => c.value === value)?.label || value;
}

/**
 * Formats a number as a price string with a dot as the thousands separator.
 * Example: 1000 -> "1.000"
 */
export function formatPrice(price: number): string {
    return Math.round(price).toLocaleString('de-DE');
}
