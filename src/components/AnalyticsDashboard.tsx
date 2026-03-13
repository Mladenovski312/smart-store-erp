'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { formatPrice, getCategoryLabel } from '@/lib/types';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────

interface OrderRaw {
    id: string;
    customer_phone: string;
    delivery_city: string;
    items: { productId: string; name: string; price: number; quantity: number }[];
    total: number;
    status: string;
    created_at: string;
}

interface SaleRaw {
    id: string;
    product_id: string;
    quantity_sold: number;
    sold_price: number;
    profit: number;
    sold_at: string;
}

interface ProductRaw {
    id: string;
    name: string;
    category: string;
    brand?: string;
    purchase_price: number;
    selling_price: number;
    stock_quantity: number;
}

// ── Constants ──────────────────────────────────────────

const NAVY = '#1A3C5E';
const ORANGE = '#E8943A';
const COLORS = [NAVY, ORANGE, '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#64748b'];
const DAY_NAMES = ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'];

const TABS = [
    { id: 'revenue', label: 'Приходи' },
    { id: 'inventory', label: 'Залиха' },
    { id: 'brands', label: 'Брендови' },
    { id: 'orders', label: 'Нарачки' },
    { id: 'customers', label: 'Купувачи' },
];

const PRESETS = [
    { id: '7d', label: '7 дена', days: 7 },
    { id: '30d', label: '30 дена', days: 30 },
    { id: '90d', label: '90 дена', days: 90 },
    { id: '12m', label: '12 месеци', days: 365 },
];

// ── Helpers ────────────────────────────────────────────

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0, 0, 0, 0);
    return d;
}

function inRange(dateStr: string, start: Date): boolean {
    return new Date(dateStr) >= start;
}

function fmtDate(dateStr: string): string {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ── Main Component ─────────────────────────────────────

export default function AnalyticsDashboard() {
    const [orders, setOrders] = useState<OrderRaw[]>([]);
    const [sales, setSales] = useState<SaleRaw[]>([]);
    const [products, setProducts] = useState<ProductRaw[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('revenue');
    const [range, setRange] = useState('30d');

    useEffect(() => {
        async function load() {
            const supabase = createClient();
            const [o, s, p] = await Promise.all([
                supabase.from('orders').select('id, customer_phone, delivery_city, items, total, status, created_at').order('created_at', { ascending: false }),
                supabase.from('sales').select('id, product_id, quantity_sold, sold_price, profit, sold_at').order('sold_at', { ascending: false }),
                supabase.from('products').select('id, name, category, brand, purchase_price, selling_price, stock_quantity'),
            ]);
            setOrders((o.data || []) as OrderRaw[]);
            setSales((s.data || []) as SaleRaw[]);
            setProducts((p.data || []) as ProductRaw[]);
            setLoading(false);
        }
        load();
    }, []);

    const rangeDays = PRESETS.find(p => p.id === range)?.days ?? 30;
    const startDate = useMemo(() => daysAgo(rangeDays), [rangeDays]);
    const fo = useMemo(() => orders.filter(o => inRange(o.created_at, startDate)), [orders, startDate]);
    const fs = useMemo(() => sales.filter(s => inRange(s.sold_at, startDate)), [sales, startDate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#1A3C5E] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-[#1A3C5E] text-white shadow-sm' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {PRESETS.map(p => (
                            <button key={p.id} onClick={() => setRange(p.id)}
                                className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors ${range === p.id ? 'bg-[#E8943A] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                    {['revenue', 'inventory', 'orders'].includes(tab) && (
                        <button
                            onClick={() => {
                                const type = tab === 'revenue' ? 'summary' : tab === 'inventory' ? 'inventory' : 'sales';
                                const url = `/api/export?type=${type}&from=${startDate.toISOString()}&to=${new Date().toISOString()}`;
                                window.open(url, '_blank');
                            }}
                            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                        >
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Извези во Excel
                        </button>
                    )}
                </div>
            </div>

            {tab === 'revenue' && <RevenueSection orders={fo} sales={fs} products={products} />}
            {tab === 'inventory' && <InventorySection products={products} />}
            {tab === 'brands' && <BrandsSection orders={fo} sales={fs} products={products} />}
            {tab === 'orders' && <OrdersSection orders={fo} />}
            {tab === 'customers' && <CustomersSection orders={fo} />}
        </div>
    );
}

// ── Shared Components ──────────────────────────────────

function Kpi({ title, value, sub }: { title: string; value: string; sub?: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function NoData() {
    return <p className="text-center text-gray-400 py-10 text-sm">Нема податоци за избраниот период</p>;
}

function CurrTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white p-2 border rounded-lg shadow text-xs">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {formatPrice(p.value)} ден</p>
            ))}
        </div>
    );
}

// ── Revenue Tab ────────────────────────────────────────

function RevenueSection({ orders, sales, products }: { orders: OrderRaw[]; sales: SaleRaw[]; products: ProductRaw[] }) {
    const rev = orders.filter(o => o.status === 'shipped' || o.status === 'delivered');
    const onlineRev = rev.reduce((s, o) => s + o.total, 0);
    const posRev = sales.reduce((s, r) => s + r.sold_price, 0);
    const total = onlineRev + posRev;
    const aov = rev.length > 0 ? onlineRev / rev.length : 0;

    // Margin
    const posProfit = sales.reduce((s, r) => s + r.profit, 0);
    const pMap = new Map(products.map(p => [p.id, p]));
    let onlineCost = 0;
    for (const o of rev) for (const item of o.items) {
        const prod = pMap.get(item.productId);
        if (prod) onlineCost += prod.purchase_price * item.quantity;
    }
    const grossProfit = posProfit + (onlineRev - onlineCost);
    const margin = total > 0 ? (grossProfit / total) * 100 : 0;

    // Revenue over time
    const byDate = new Map<string, { online: number; pos: number }>();
    for (const o of rev) {
        const d = o.created_at.slice(0, 10);
        const e = byDate.get(d) || { online: 0, pos: 0 };
        e.online += o.total;
        byDate.set(d, e);
    }
    for (const s of sales) {
        const d = s.sold_at.slice(0, 10);
        const e = byDate.get(d) || { online: 0, pos: 0 };
        e.pos += s.sold_price;
        byDate.set(d, e);
    }
    const timeData = Array.from(byDate.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([d, v]) => ({ date: fmtDate(d), Онлајн: Math.round(v.online), POS: Math.round(v.pos) }));

    // Revenue by weekday (Mon–Sat, skip Sun index 0)
    const wdTotals = [0, 0, 0, 0, 0, 0, 0];
    const wdCounts = [0, 0, 0, 0, 0, 0, 0];
    for (const o of rev) { const d = new Date(o.created_at).getDay(); wdTotals[d] += o.total; wdCounts[d]++; }
    for (const s of sales) { const d = new Date(s.sold_at).getDay(); wdTotals[d] += s.sold_price; wdCounts[d]++; }
    const wdData = [1, 2, 3, 4, 5, 6, 0].map(i => ({
        day: DAY_NAMES[i],
        revenue: wdCounts[i] > 0 ? Math.round(wdTotals[i] / wdCounts[i]) : 0,
    }));

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Kpi title="Вкупен приход" value={`${formatPrice(total)} ден`} />
                <Kpi title="Онлајн" value={`${formatPrice(onlineRev)} ден`} sub={`${rev.length} нарачки`} />
                <Kpi title="POS" value={`${formatPrice(posRev)} ден`} sub={`${sales.length} продажби`} />
                <Kpi title="Просечна нарачка" value={`${formatPrice(aov)} ден`} />
                <Kpi title="Маржа" value={`${margin.toFixed(1)}%`} sub={`${formatPrice(grossProfit)} ден профит`} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Приход по ден">
                    {timeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} />
                                <Tooltip content={<CurrTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="Онлајн" stroke={NAVY} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="POS" stroke={ORANGE} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </Card>
                <Card title="Просечен приход по ден во неделата">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={wdData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} />
                            <Tooltip content={<CurrTooltip />} />
                            <Bar dataKey="revenue" fill={NAVY} radius={[4, 4, 0, 0]} name="Приход" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
}

// ── Inventory Tab ──────────────────────────────────────

function InventorySection({ products }: { products: ProductRaw[] }) {
    const inStock = products.filter(p => p.stock_quantity > 0);
    const outOfStock = products.filter(p => p.stock_quantity === 0);
    const totalUnits = products.reduce((s, p) => s + p.stock_quantity, 0);
    const stockValue = products.reduce((s, p) => s + p.purchase_price * p.stock_quantity, 0);
    const lowStock = inStock.filter(p => p.stock_quantity <= 3).sort((a, b) => a.stock_quantity - b.stock_quantity);

    // Stock value by category
    const catMap = new Map<string, number>();
    for (const p of products) {
        catMap.set(p.category, (catMap.get(p.category) || 0) + p.purchase_price * p.stock_quantity);
    }
    const catData = Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([cat, val]) => ({ category: getCategoryLabel(cat), value: Math.round(val) }));

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Kpi title="Вредност на залиха" value={`${formatPrice(stockValue)} ден`} sub="Набавна вредност" />
                <Kpi title="На залиха" value={String(inStock.length)} sub={`${totalUnits} единици`} />
                <Kpi title="Без залиха" value={String(outOfStock.length)} />
                <Kpi title="Ниска залиха (≤3)" value={String(lowStock.length)} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Вредност по категорија (набавна)">
                    {catData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={catData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} />
                                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={140} />
                                <Tooltip content={<CurrTooltip />} />
                                <Bar dataKey="value" fill={NAVY} radius={[0, 4, 4, 0]} name="Вредност" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </Card>
                <Card title="Производи со ниска залиха">
                    {lowStock.length > 0 ? (
                        <div className="max-h-[18.75rem] overflow-y-auto">
                            <table className="w-full text-sm table-fixed">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-[55%]">Производ</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 w-[15%]">Залиха</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 w-[30%]">Цена</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {lowStock.map(p => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-900 truncate">{p.name}</td>
                                            <td className={`px-3 py-2 text-right font-semibold ${p.stock_quantity <= 1 ? 'text-red-600' : 'text-orange-500'}`}>
                                                {p.stock_quantity}
                                            </td>
                                            <td className="px-3 py-2 text-right text-gray-600">{formatPrice(p.selling_price)} ден</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-center text-gray-400 py-10 text-sm">Сите производи имаат доволно залиха</p>}
                </Card>
            </div>
        </div>
    );
}

// ── Brands Tab ─────────────────────────────────────────

function BrandsSection({ orders, sales, products }: { orders: OrderRaw[]; sales: SaleRaw[]; products: ProductRaw[] }) {
    const pMap = new Map(products.map(p => [p.id, p]));
    const hasBrands = products.some(p => p.brand);
    const getGroup = (p: ProductRaw) => hasBrands ? (p.brand || 'Непознат') : getCategoryLabel(p.category);

    // Aggregate revenue + cost by brand/category
    const groups = new Map<string, { revenue: number; units: number; cost: number }>();

    for (const order of orders) {
        if (order.status === 'cancelled') continue;
        for (const item of order.items) {
            const prod = pMap.get(item.productId);
            const key = prod ? getGroup(prod) : 'Непознат';
            const e = groups.get(key) || { revenue: 0, units: 0, cost: 0 };
            e.revenue += item.price * item.quantity;
            e.units += item.quantity;
            if (prod) e.cost += prod.purchase_price * item.quantity;
            groups.set(key, e);
        }
    }
    for (const sale of sales) {
        const prod = pMap.get(sale.product_id);
        const key = prod ? getGroup(prod) : 'Непознат';
        const e = groups.get(key) || { revenue: 0, units: 0, cost: 0 };
        e.revenue += sale.sold_price;
        e.units += sale.quantity_sold;
        if (prod) e.cost += prod.purchase_price * sale.quantity_sold;
        groups.set(key, e);
    }

    const brandData = Array.from(groups.entries())
        .map(([name, d]) => ({
            name,
            revenue: Math.round(d.revenue),
            units: d.units,
            margin: d.revenue > 0 ? Math.round(((d.revenue - d.cost) / d.revenue) * 100) : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue);

    const groupLabel = hasBrands ? 'Бренд' : 'Категорија';

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title={`Удел во приход по ${groupLabel.toLowerCase()}`}>
                    {brandData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={brandData.slice(0, 8)} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                                    dataKey="revenue" nameKey="name" paddingAngle={2}>
                                    {brandData.slice(0, 8).map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CurrTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </Card>
                <Card title={`${groupLabel} табела`}>
                    {brandData.length > 0 ? (
                        <div className="max-h-[18.75rem] overflow-y-auto">
                            <table className="w-full text-sm table-fixed">
                                <thead className="sticky top-0 bg-white">
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 w-[28%]">{groupLabel}</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 w-[24%]">Приход</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 w-[14%]">Ед.</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 w-[14%]">Маржа</th>
                                        <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 w-[20%]">Препорака</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {brandData.map(b => {
                                        const rec = b.margin > 30 ? { t: 'Прошири', c: 'text-green-600 bg-green-50' }
                                            : b.margin > 15 ? { t: 'Одржувај', c: 'text-blue-600 bg-blue-50' }
                                                : { t: 'Намали', c: 'text-red-600 bg-red-50' };
                                        return (
                                            <tr key={b.name} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 font-medium text-gray-900 truncate">{b.name}</td>
                                                <td className="px-3 py-2 text-right">{formatPrice(b.revenue)} ден</td>
                                                <td className="px-3 py-2 text-right">{b.units}</td>
                                                <td className="px-3 py-2 text-right font-semibold">{b.margin}%</td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rec.c}`}>{rec.t}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : <NoData />}
                </Card>
            </div>
        </div>
    );
}

// ── Orders Tab ─────────────────────────────────────────

function OrdersSection({ orders }: { orders: OrderRaw[] }) {
    const pending = orders.filter(o => o.status === 'pending').length;
    const shipped = orders.filter(o => o.status === 'shipped').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    const cancelRate = orders.length > 0 ? (cancelled / orders.length) * 100 : 0;

    // Volume over time
    const byDate = new Map<string, number>();
    for (const o of orders) {
        const d = o.created_at.slice(0, 10);
        byDate.set(d, (byDate.get(d) || 0) + 1);
    }
    const volData = Array.from(byDate.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([d, c]) => ({ date: fmtDate(d), count: c }));

    // Status breakdown
    const STATUS_LABELS: Record<string, string> = {
        pending: 'За обработка', shipped: 'Испратена', delivered: 'Доставена', cancelled: 'Откажана',
    };
    const STATUS_COLORS: Record<string, string> = {
        'За обработка': '#eab308', 'Испратена': '#8b5cf6', 'Доставена': '#22c55e', 'Откажана': '#ef4444',
    };
    const statusData = [
        { name: 'За обработка', value: pending },
        { name: 'Испратена', value: shipped },
        { name: 'Доставена', value: delivered },
        { name: 'Откажана', value: cancelled },
    ].filter(s => s.value > 0);

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Kpi title="Вкупно нарачки" value={String(orders.length)} />
                <Kpi title="За обработка" value={String(pending)} />
                <Kpi title="Доставени" value={String(delivered)} />
                <Kpi title="Стапка на откажување" value={`${cancelRate.toFixed(1)}%`}
                    sub={cancelRate > 5 ? 'Над целта од 5%' : 'Под целта од 5%'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Број на нарачки по ден">
                    {volData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={volData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill={NAVY} radius={[4, 4, 0, 0]} name="Нарачки" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </Card>
                <Card title="Статус на нарачки">
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={110}
                                    dataKey="value" nameKey="name" paddingAngle={2}
                                    label={({ name, percent }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {statusData.map((s) => (
                                        <Cell key={s.name} fill={STATUS_COLORS[s.name] || '#999'} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </Card>
            </div>
        </div>
    );
}

// ── Customers Tab ──────────────────────────────────────

function CustomersSection({ orders }: { orders: OrderRaw[] }) {
    // Group by phone
    const custMap = new Map<string, { orders: number; total: number; last: string }>();
    for (const o of orders) {
        if (o.status === 'cancelled') continue;
        const key = o.customer_phone;
        const e = custMap.get(key) || { orders: 0, total: 0, last: '' };
        e.orders++;
        e.total += o.total;
        if (o.created_at > e.last) e.last = o.created_at;
        custMap.set(key, e);
    }

    const unique = custMap.size;
    const repeat = Array.from(custMap.values()).filter(c => c.orders >= 2).length;
    const repeatRate = unique > 0 ? (repeat / unique) * 100 : 0;
    const totalRev = Array.from(custMap.values()).reduce((s, c) => s + c.total, 0);
    const avgLTV = unique > 0 ? totalRev / unique : 0;

    // Segments
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const segments = { new: 0, returning: 0, loyal: 0, atRisk: 0 };
    for (const c of custMap.values()) {
        const isOld = new Date(c.last) < sixMonthsAgo;
        if (c.orders >= 5) { if (isOld) segments.atRisk++; else segments.loyal++; }
        else if (c.orders >= 2) { if (isOld) segments.atRisk++; else segments.returning++; }
        else { if (isOld) segments.atRisk++; else segments.new++; }
    }

    // Revenue by city
    const cityMap = new Map<string, number>();
    for (const o of orders) {
        if (o.status === 'cancelled') continue;
        const city = o.delivery_city || 'Непознат';
        cityMap.set(city, (cityMap.get(city) || 0) + o.total);
    }
    const cityData = Array.from(cityMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([city, rev]) => ({ city, revenue: Math.round(rev) }));

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <Kpi title="Уникатни купувачи" value={String(unique)} />
                <Kpi title="Повторни купувачи" value={`${repeatRate.toFixed(1)}%`} sub={`${repeat} купувачи`} />
                <Kpi title="Просечна вредност (LTV)" value={`${formatPrice(avgLTV)} ден`} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Приход по град (Топ 10)">
                    {cityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={cityData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatPrice(v)} />
                                <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={100} />
                                <Tooltip content={<CurrTooltip />} />
                                <Bar dataKey="revenue" fill={ORANGE} radius={[0, 4, 4, 0]} name="Приход" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <NoData />}
                </Card>
                <Card title="Сегменти на купувачи">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-blue-700">{segments.new}</p>
                            <p className="text-xs text-blue-600 font-medium mt-1">Нови (1 нарачка)</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-700">{segments.returning}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">Повторни (2-4)</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-purple-700">{segments.loyal}</p>
                            <p className="text-xs text-purple-600 font-medium mt-1">Лојални (5+)</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-red-700">{segments.atRisk}</p>
                            <p className="text-xs text-red-600 font-medium mt-1">Ризични (6+ мес.)</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
