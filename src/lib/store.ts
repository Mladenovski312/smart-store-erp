/**
 * Supabase-backed data layer for the InterStar Jumbo POS.
 * All functions are async and operate directly on the Supabase database.
 */
import { createClient } from './supabase';
import { cyrillicToLatin } from './search';
import { Product, SaleRecord, DashboardStats } from './types';

// ─── Helpers ─────────────────────────────────────────
// Supabase uses snake_case, TypeScript uses camelCase. Map between them.

function dbToProduct(row: Record<string, unknown>): Product {
    return {
        id: row.id as string,
        slug: (row.slug as string) || (row.id as string),
        name: row.name as string,
        description: row.description as string | undefined,
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

export async function getProductById(id: string): Promise<Product | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return dbToProduct(data);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return null;
    return dbToProduct(data);
}

/** Fetch related products for cross-sell: same category first, then price-range fallback. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
    const supabase = createClient();

    // 1. Same category, exclude current product, in stock
    const { data: sameCat } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .gt('stock_quantity', 0)
        .limit(limit);

    const results = (sameCat || []).map(dbToProduct);
    if (results.length >= 3) return results.slice(0, limit);

    // 2. Fallback: similar price range (±30%) from any category
    const existingIds = new Set(results.map(p => p.id));
    existingIds.add(product.id);
    const priceLow = Math.round(product.sellingPrice * 0.7);
    const priceHigh = Math.round(product.sellingPrice * 1.3);

    const { data: byPrice } = await supabase
        .from('products')
        .select('*')
        .gte('selling_price', priceLow)
        .lte('selling_price', priceHigh)
        .gt('stock_quantity', 0)
        .limit(limit * 2);

    for (const row of byPrice || []) {
        if (results.length >= limit) break;
        const p = dbToProduct(row);
        if (!existingIds.has(p.id)) {
            results.push(p);
            existingIds.add(p.id);
        }
    }

    return results.slice(0, limit);
}

function generateSlug(name: string): string {
    return cyrillicToLatin(name.toLowerCase())
        .replace(/[^a-z0-9\-]/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^-|-$/g, '')
        || 'product';
}

export async function saveProduct(
    product: Omit<Product, 'id' | 'slug' | 'createdAt' | 'updatedAt'>
): Promise<Product | null> {
    const supabase = createClient();
    const slug = generateSlug(product.name) + '-' + Date.now().toString(36);
    const { data, error } = await supabase
        .from('products')
        .insert({
            name: product.name,
            slug,
            description: product.description || null,
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
    const saved = dbToProduct(data);
    logAdminAction('product.create', 'product', saved.id, { name: saved.name, price: saved.sellingPrice });
    return saved;
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
    logAdminAction('product.delete', 'product', productId);
}

/** Upload an image file to Supabase Storage and return its public URL. */
export async function uploadProductImage(file: File): Promise<string | null> {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '31536000', upsert: false });

    if (error) {
        console.error('Image upload failed:', error);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

/** Update any subset of product fields. */
export async function updateProduct(
    productId: string,
    updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product | null> {
    const supabase = createClient();

    // Map camelCase fields to snake_case DB columns
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl || null;
    if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
    if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
    if (updates.stockQuantity !== undefined) dbUpdates.stock_quantity = updates.stockQuantity;
    if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes || null;

    const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', productId)
        .select()
        .single();

    if (error || !data) return null;
    const updated = dbToProduct(data);
    logAdminAction('product.update', 'product', productId, updates);
    return updated;
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

    // Atomic: deduct stock + insert sale in a single DB transaction
    const { data, error } = await supabase.rpc('record_sale_atomic', {
        p_product_id: product.id,
        p_quantity: quantity,
    });

    if (error || !data) return null;

    const sale: SaleRecord = {
        id: data.id,
        productId: data.product_id,
        productName: data.product_name,
        quantitySold: data.quantity_sold,
        soldPrice: data.sold_price,
        profit: data.profit,
        soldAt: new Date().toISOString(),
    };

    logAdminAction('sale.pos', 'product', product.id, { name: data.product_name, quantity, total: data.sold_price });
    return sale;
}

// ─── Audit Logging ───────────────────────────────────
/** Fire-and-forget audit log for admin actions. Never throws. */
export async function logAdminAction(
    action: string,
    targetType: string,
    targetId: string,
    details: Record<string, unknown> = {}
): Promise<void> {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('admin_audit_log').insert({
            user_email: user?.email || 'unknown',
            action,
            target_type: targetType,
            target_id: targetId,
            details,
        });
    } catch (err) {
        // Audit log should never break the main operation, but report the failure
        console.error('Audit log failed:', action, targetType, targetId, err);
    }
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
