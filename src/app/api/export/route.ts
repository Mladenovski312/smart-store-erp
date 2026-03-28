import * as XLSX from 'xlsx';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getCategoryLabel, OrderItem } from '@/lib/types';

export async function GET(req: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'sales'; // 'sales' | 'inventory' | 'summary'
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}/.test(d) && !isNaN(Date.parse(d));
    if (from && !isValidDate(from)) return NextResponse.json({ error: 'Invalid from date' }, { status: 400 });
    if (to && !isValidDate(to)) return NextResponse.json({ error: 'Invalid to date' }, { status: 400 });

    const safeFrom = from ? from.slice(0, 10).replace(/[^0-9-]/g, '') : null;
    const safeTo = to ? to.slice(0, 10).replace(/[^0-9-]/g, '') : null;

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let filename = 'export.xlsx';

    if (type === 'sales') {
        let query = supabase
            .from('orders')
            .select('*')
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false });

        if (safeFrom) query = query.gte('created_at', safeFrom);
        if (safeTo) query = query.lte('created_at', safeTo);

        const { data } = await query;

        const rows = (data || []).map(o => ({
            'Датум': new Date(o.created_at).toLocaleDateString('mk-MK'),
            'Нарачка': o.id.slice(0, 8).toUpperCase(),
            'Клиент': o.customer_name,
            'Град': o.delivery_city || 'Непознат',
            'Производи': Array.isArray(o.items)
                ? o.items.map((i: OrderItem) => `${i.name} (x${i.quantity})`).join(', ')
                : '',
            'Вкупно (ден)': o.total,
            'Плаќање': 'Готовина при достава',
            'Статус': o.status === 'pending' ? 'За обработка' : o.status === 'shipped' ? 'Испратена' : o.status === 'delivered' ? 'Доставена' : o.status,
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [12, 12, 20, 15, 50, 14, 22, 15].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, 'Продажби');
        filename = `prodazbi-${safeFrom ?? 'all'}.xlsx`;

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

            const margin = p.selling_price > 0 ? ((p.selling_price - p.purchase_price) / p.selling_price * 100) : 0;
            return {
                'Назив': p.name,
                'Бренд': p.brand || '-',
                'Категорија': getCategoryLabel(p.category),
                'Залиха (ком)': p.stock_quantity,
                'Набавна цена (ден)': p.purchase_price,
                'Продажна цена (ден)': p.selling_price,
                'Маржа %': margin.toFixed(1) + '%',
                'Набавна вредност': p.purchase_price * p.stock_quantity,
                'Продажна вредност': p.selling_price * p.stock_quantity,
                'Последна продажба': lastSoldDate ? lastSoldDate.toLocaleDateString('mk-MK') : '-',
                'Денови без продажба': daysWithoutSale,
            };
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [35, 15, 15, 12, 18, 18, 10, 20, 20, 18, 20].map(w => ({ wch: w }));
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

        if (safeFrom) {
            orderQuery = orderQuery.gte('created_at', safeFrom);
            salesQuery = salesQuery.gte('sold_at', safeFrom);
        }
        if (safeTo) {
            orderQuery = orderQuery.lte('created_at', safeTo);
            salesQuery = salesQuery.lte('sold_at', safeTo);
        }

        const [{ data: orders }, { data: posSales }, { data: products }] = await Promise.all([
            orderQuery,
            salesQuery,
            supabase.from('products').select('id, purchase_price')
        ]);

        const pMap = new Map((products || []).map(p => [p.id, p]));

        // Group by month
        const monthlyData = new Map();

        const addMonthlyData = (dateStr: string, revenue: number, cost: number, profit: number, units: number, count: number) => {
            const month = dateStr.slice(0, 7); // YYYY-MM
            const current = monthlyData.get(month) || { revenue: 0, cost: 0, profit: 0, units: 0, orders: 0 };
            current.revenue += revenue;
            current.cost += cost;
            current.profit += profit;
            current.units += units;
            current.orders += count;
            monthlyData.set(month, current);
        };

        (orders || []).forEach(o => {
            let cost = 0;
            let units = 0;
            if (Array.isArray(o.items)) {
                o.items.forEach((item: OrderItem) => {
                    const p = pMap.get(item.productId);
                    if (p) cost += p.purchase_price * item.quantity;
                    units += item.quantity;
                });
            }
            addMonthlyData(o.created_at, o.total, cost, o.total - cost, units, 1);
        });

        (posSales || []).forEach(s => {
            const p = pMap.get(s.product_id);
            const cost = p ? p.purchase_price * s.quantity_sold : 0;
            addMonthlyData(s.sold_at, s.sold_price, cost, s.profit, s.quantity_sold, 1);
        });

        const rows = Array.from(monthlyData.entries())
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, d]) => {
                const margin = d.revenue > 0 ? (d.profit / d.revenue) * 100 : 0;
                const avgOrder = d.orders > 0 ? d.revenue / d.orders : 0;
                const profitPerTx = d.orders > 0 ? d.profit / d.orders : 0;
                return {
                    'Месец': month,
                    'Приход (ден)': Math.round(d.revenue),
                    'COGS (ден)': Math.round(d.cost),
                    'Бруто добивка (ден)': Math.round(d.profit),
                    'Маржина %': margin.toFixed(2) + '%',
                    'Единици продадени': d.units,
                    'Бр. трансакции': d.orders,
                    'Просечна трансакција (ден)': Math.round(avgOrder),
                    'Профит по трансакција (ден)': Math.round(profitPerTx),
                };
            });

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [10, 15, 12, 20, 12, 18, 15, 24, 26].map(w => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, 'Извештај');
        filename = `mesecen-izvestaj-${safeFrom ? safeFrom.slice(0, 4) : new Date().getFullYear()}.xlsx`;
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
