/**
 * Supabase-backed data layer for the InterStar Jumbo POS.
 * All functions are async and operate directly on the Supabase database.
 */
import { createClient } from './supabase';
import { Product, SaleRecord, DashboardStats } from './types';

// ─── Helpers ─────────────────────────────────────────
// Supabase uses snake_case, TypeScript uses camelCase. Map between them.

function dbToProduct(row: Record<string, unknown>): Product {
    return {
        id: row.id as string,
        name: row.name as string,
        category: row.category as string,
        imageUrl: row.image_url as string | undefined,
        purchasePrice: Number(row.purchase_price) || 0,
        sellingPrice: Number(row.selling_price) || 0,
        stockQuantity: Number(row.stock_quantity) || 0,
        barcode: row.barcode as string | undefined,
        notes: row.notes as string | undefined,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

function dbToSale(row: Record<string, unknown>): SaleRecord {
    return {
        id: row.id as string,
        productId: row.product_id as string,
        productName: row.product_name as string,
        quantitySold: Number(row.quantity_sold) || 0,
        soldPrice: Number(row.sold_price) || 0,
        profit: Number(row.profit) || 0,
        soldAt: row.sold_at as string,
    };
}

// ─── Products ────────────────────────────────────────
export async function getProducts(): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(dbToProduct);
}

export async function saveProduct(
    product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            category: product.category,
            image_url: product.imageUrl || null,
            purchase_price: product.purchasePrice,
            selling_price: product.sellingPrice,
            stock_quantity: product.stockQuantity,
            barcode: product.barcode || null,
            notes: product.notes || null,
        })
        .select()
        .single();

    if (error || !data) return null;
    return dbToProduct(data);
}

export async function updateProductStock(productId: string, newQuantity: number): Promise<void> {
    const supabase = createClient();
    await supabase
        .from('products')
        .update({ stock_quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', productId);
}

export async function deleteProduct(productId: string): Promise<void> {
    const supabase = createClient();
    await supabase
        .from('products')
        .delete()
        .eq('id', productId);
}

// ─── Sales ───────────────────────────────────────────
export async function getSales(): Promise<SaleRecord[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('sold_at', { ascending: false });

    if (error || !data) return [];
    return data.map(dbToSale);
}

export async function recordSale(product: Product, quantity: number): Promise<SaleRecord | null> {
    const supabase = createClient();
    const profit = (product.sellingPrice - product.purchasePrice) * quantity;

    const { data, error } = await supabase
        .from('sales')
        .insert({
            product_id: product.id,
            product_name: product.name,
            quantity_sold: quantity,
            sold_price: product.sellingPrice * quantity,
            profit: profit,
        })
        .select()
        .single();

    if (error || !data) return null;

    // Decrease stock
    await updateProductStock(product.id, product.stockQuantity - quantity);

    return dbToSale(data);
}

// ─── Stats ───────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
    const [products, sales] = await Promise.all([getProducts(), getSales()]);
    const today = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter(s => s.soldAt.slice(0, 10) === today);

    return {
        totalProducts: products.reduce((sum, p) => sum + p.stockQuantity, 0),
        totalStockValue: products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0),
        todaySalesTotal: todaySales.reduce((sum, s) => sum + s.soldPrice, 0),
        todaySalesCount: todaySales.reduce((sum, s) => sum + s.quantitySold, 0),
    };
}
