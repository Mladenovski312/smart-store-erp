"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Package, Truck, CheckCircle, XCircle, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '@/lib/types';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    delivery_address: string;
    delivery_city: string;
    note: string | null;
    items: OrderItem[];
    subtotal: number;
    delivery_cost: number;
    total: number;
    status: string;
    payment_method: string;
    created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: 'За обработка', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Package size={14} /> },
    shipped: { label: 'Испратена', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Truck size={14} /> },
    delivered: { label: 'Доставена', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle size={14} /> },
    cancelled: { label: 'Откажана', color: 'bg-red-100 text-red-700 border-red-200', icon: <XCircle size={14} /> },
};

const STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPanel() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [confirmAction, setConfirmAction] = useState<{ id: string, status: string, label: string } | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const supabase = createClient();

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setOrders(data as Order[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateStatus = async (orderId: string, newStatus: string, trackingNum?: string) => {
        // Restore stock when cancelling — but only if not already cancelled (prevents double restore)
        if (newStatus === 'cancelled') {
            const order = orders.find(o => o.id === orderId);
            if (order && order.status !== 'cancelled') {
                const stockItems = order.items.map(i => ({ id: i.productId, quantity: i.quantity }));
                const { error: restoreError } = await supabase.rpc('restore_order_stock', { items: stockItems });
                if (restoreError) {
                    console.error('Failed to restore stock for cancelled order:', orderId, restoreError);
                }
            }
        }

        const updateData: Record<string, string> = { status: newStatus };
        if (trackingNum) updateData.tracking_number = trackingNum;

        await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        // Send email when marked as shipped
        if (newStatus === 'shipped') {
            const order = orders.find(o => o.id === orderId);
            if (order?.customer_email) {
                fetch('/api/emails/order-shipped', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: order.id,
                        customerName: order.customer_name,
                        customerEmail: order.customer_email,
                        deliveryCity: order.delivery_city,
                        trackingNumber: trackingNum || null,
                    }),
                }).catch(() => { /* email failure shouldn't block status update */ });
            }
        }

        fetchOrders();
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
                {[
                    { value: 'all', label: `Сите (${orders.length})` },
                    { value: 'pending', label: `За обработка (${pendingCount})` },
                    { value: 'shipped', label: 'Испратени' },
                    { value: 'delivered', label: 'Доставени' },
                    { value: 'cancelled', label: 'Откажани' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${filter === tab.value
                            ? 'bg-jumbo-blue text-white shadow-md transform scale-105'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Нема нарачки</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(order => {
                        const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const isExpanded = expandedId === order.id;
                        const date = new Date(order.created_at);

                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
                                            {config.icon}
                                            {config.label}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm">{order.customer_name}</p>
                                            <p className="text-xs text-gray-400">
                                                {date.toLocaleDateString('mk-MK')} · {date.toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-jumbo-blue text-sm">{formatPrice(order.total)} ден</span>
                                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-4 space-y-4">
                                        {/* Customer Info */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                <a href={`tel:${order.customer_phone}`} className="hover:text-jumbo-blue">{order.customer_phone}</a>
                                            </div>
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <MapPin size={14} className="text-gray-400 mt-0.5" />
                                                <span>{order.delivery_address}, {order.delivery_city}</span>
                                            </div>
                                        </div>

                                        {order.note && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                                💬 {order.note}
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Артикли</p>
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm py-1">
                                                    <span className="text-gray-700">{item.quantity}x {item.name}</span>
                                                    <span className="font-medium">{formatPrice(item.price * item.quantity)} ден</span>
                                                </div>
                                            ))}
                                            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm">
                                                <span className="text-gray-500">Испорака</span>
                                                <span className="text-xs text-gray-400 italic">По договор</span>
                                            </div>
                                        </div>

                                        {/* Status Change */}
                                        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <p className="text-sm font-bold text-gray-900 mb-3">Промени статус на нарачка:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {STATUSES.map(s => {
                                                    const sc = STATUS_CONFIG[s];
                                                    const isCurrent = order.status === s;
                                                    return (
                                                        <button
                                                            key={s}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setConfirmAction({ id: order.id, status: s, label: sc.label });
                                                            }}
                                                            disabled={isCurrent}
                                                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all ${isCurrent
                                                                ? sc.color + ' border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] cursor-default ring-2 ring-white'
                                                                : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:border-jumbo-blue hover:text-jumbo-blue hover:shadow-md hover:-translate-y-0.5'
                                                                }`}
                                                        >
                                                            {sc.icon}
                                                            <span className="text-xs font-bold">{sc.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Confirmation Dialog */}
                                            {confirmAction?.id === order.id && (
                                                <div className="mt-4 p-4 bg-jumbo-blue/5 border border-jumbo-blue/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-200">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 leading-tight">Потврда за промена</p>
                                                        <p className="text-xs text-gray-600 mt-1">Сигурно сакате да го промените статусот во <strong className="text-gray-900">{confirmAction.label}</strong>?</p>
                                                        {confirmAction.status === 'shipped' && (
                                                            <>
                                                                <p className="text-xs text-red-600 font-semibold mt-1.5">
                                                                    ⚠️ Внимание: Ова ќе испрати емаил известување до купувачот.
                                                                </p>
                                                                <input
                                                                    type="text"
                                                                    value={trackingNumber}
                                                                    onChange={e => setTrackingNumber(e.target.value)}
                                                                    onClick={e => e.stopPropagation()}
                                                                    placeholder="Број за следење (опционално)"
                                                                    className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue outline-none"
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setConfirmAction(null);
                                                                setTrackingNumber('');
                                                            }}
                                                            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Откажи
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateStatus(order.id, confirmAction.status, trackingNumber || undefined);
                                                                setConfirmAction(null);
                                                                setTrackingNumber('');
                                                            }}
                                                            className="flex-1 px-4 py-2 bg-jumbo-blue text-white rounded-lg text-xs font-bold hover:bg-blue-800 transition-colors"
                                                        >
                                                            ПОТВРДИ
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
