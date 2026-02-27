// Types for the Inter Star Jumbo POS system

export interface Product {
    id: string;
    name: string;
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
