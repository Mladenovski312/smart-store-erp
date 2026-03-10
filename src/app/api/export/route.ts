import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { getCategoryLabel } from '@/lib/types';

export async function GET(req: NextRequest) {
    const supabase = createClient();

    // Auth check - wait, createBrowserClient inside createClient() can be used here?
    // Actually yes, the app router handles cookies if using @supabase/ssr properly, 
    // but in API route we might need an admin check or skip it if it's internal.
    // The previous specs said:
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // We will include the auth check as per spec.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'sales'; // 'sales' | 'inventory' | 'summary'
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let wb: XLSX.WorkBook = XLSX.utils.book_new();
    let filename = 'export.xlsx';

    if (type === 'sales') {
        let query = supabase
            .from('orders')
            .select('*')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false });

        if (from) query = query.gte('created_at', from);
        if (to) query = query.lte('created_at', to);

        const { data } = await query;

        const rows = (data || []).map(o => ({
            'Датум': new Date(o.created_at).toLocaleDateString('mk-MK'),
            'Нарачка': o.id.slice(0, 8).toUpperCase(),
            'Клиент': o.customer_name,
            'Град': o.delivery_city || 'Непознат',
            'Производи': Array.isArray(o.items)
                ? o.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')
                : '',
            'Вкупно (ден)': o.total,
            'Плаќање': 'Готовина при достава',
            'Статус': o.status === 'pending' ? 'За обработка' : o.status === 'shipped' ? 'Испратена' : o.status === 'delivered' ? 'Доставена' : o.status,
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [12, 12, 20, 15, 50, 14, 22, 15].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, 'Продажби');
        filename = `prodazbi-${from ? from.slice(0, 10) : 'all'}.xlsx`;

    } else if (type === 'inventory') {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .order('name');

        const { data: sales } = await supabase
            .from('sales')
            .select('product_id, sold_at')
            .order('sold_at', { ascending: false });

        const lastSoldMap = new Map();
        (sales || []).forEach(s => {
            if (!lastSoldMap.has(s.product_id)) {
                lastSoldMap.set(s.product_id, s.sold_at);
            }
        });

        const now = new Date();
        const rows = (products || []).map(p => {
            const lastSoldStr = lastSoldMap.get(p.id);
            const lastSoldDate = lastSoldStr ? new Date(lastSoldStr) : null;
            let daysWithoutSale = '-';
            if (lastSoldDate) {
                const diffTime = Math.abs(now.getTime() - lastSoldDate.getTime());
                daysWithoutSale = Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
            }

            return {
                'Назив': p.name,
                'Бренд': p.brand || '-',
                'Категорија': getCategoryLabel(p.category),
                'Залиха (ком)': p.stock_quantity,
                'Набавна цена (ден)': p.purchase_price,
                'Продажна цена (ден)': p.selling_price,
                'Вредност на залиха': p.purchase_price * p.stock_quantity,
                'Последна продажба': lastSoldDate ? lastSoldDate.toLocaleDateString('mk-MK') : '-',
                'Денови без продажба': daysWithoutSale,
            };
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [35, 15, 15, 12, 18, 18, 20, 18, 20].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, 'Залиха');
        filename = `zaliha-${new Date().toISOString().slice(0, 10)}.xlsx`;

    } else if (type === 'summary') {
        let orderQuery = supabase
            .from('orders')
            .select('*')
            .in('status', ['shipped', 'delivered']);

        let salesQuery = supabase
            .from('sales')
            .select('*');

        if (from) {
            orderQuery = orderQuery.gte('created_at', from);
            salesQuery = salesQuery.gte('sold_at', from);
        }
        if (to) {
            orderQuery = orderQuery.lte('created_at', to);
            salesQuery = salesQuery.lte('sold_at', to);
        }

        const [{ data: orders }, { data: posSales }, { data: products }] = await Promise.all([
            orderQuery,
            salesQuery,
            supabase.from('products').select('id, purchase_price')
        ]);

        const pMap = new Map((products || []).map(p => [p.id, p]));

        // Group by month
        const monthlyData = new Map();

        const addMonthlyData = (dateStr: string, revenue: number, cost: number, count: number) => {
            const month = dateStr.slice(0, 7); // YYYY-MM
            const current = monthlyData.get(month) || { revenue: 0, cost: 0, orders: 0 };
            current.revenue += revenue;
            current.cost += cost;
            current.orders += count;
            monthlyData.set(month, current);
        };

        (orders || []).forEach(o => {
            let cost = 0;
            if (Array.isArray(o.items)) {
                o.items.forEach((item: any) => {
                    const p = pMap.get(item.productId);
                    if (p) cost += p.purchase_price * item.quantity;
                });
            }
            addMonthlyData(o.created_at, o.total, cost, 1);
        });

        (posSales || []).forEach(s => {
            const p = pMap.get(s.product_id);
            const cost = p ? p.purchase_price * s.quantity_sold : 0;
            addMonthlyData(s.sold_at, s.sold_price, cost, 1);
        });

        const rows = Array.from(monthlyData.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, d]) => {
                const grossProfit = d.revenue - d.cost;
                const margin = d.revenue > 0 ? (grossProfit / d.revenue) * 100 : 0;
                const avgOrder = d.orders > 0 ? d.revenue / d.orders : 0;
                return {
                    'Месец': month,
                    'Приход (ден)': Math.round(d.revenue),
                    'COGS (ден)': Math.round(d.cost),
                    'Бруто добивка (ден)': Math.round(grossProfit),
                    'Маржина %': margin.toFixed(2) + '%',
                    'Бр. нарачки': d.orders,
                    'Просечна трансакција': Math.round(avgOrder),
                };
            });

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [10, 15, 12, 20, 12, 12, 22].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, 'Извештај');
        filename = `mesecen-izvestaj-${from ? from.slice(0, 4) : new Date().getFullYear()}.xlsx`;
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
