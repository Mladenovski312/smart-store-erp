"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { logAdminAction } from '@/lib/store';
import { Package, Truck, CheckCircle, XCircle, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice, OrderItem } from '@/lib/types';

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
    const [filter, setFilter] = useState('pending');
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

        const order2 = orders.find(o => o.id === orderId);
        logAdminAction('order.status_change', 'order', orderId, {
            from: order2?.status,
            to: newStatus,
            ...(trackingNum ? { tracking: trackingNum } : {}),
        });

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
            <div className="bg-gray-100 rounded-2xl p-2 flex flex-wrap items-center justify-center gap-2">
                {[
                    { value: 'pending', label: 'За обработка', count: pendingCount, activeBg: 'bg-orange-500 text-white', activeShadow: 'shadow-orange-500/30' },
                    { value: 'shipped', label: 'Испратени', count: orders.filter(o => o.status === 'shipped').length, activeBg: 'bg-yellow-500 text-white', activeShadow: 'shadow-yellow-500/30' },
                    { value: 'delivered', label: 'Доставени', count: orders.filter(o => o.status === 'delivered').length, activeBg: 'bg-green-600 text-white', activeShadow: 'shadow-green-600/30' },
                    { value: 'cancelled', label: 'Откажани', count: orders.filter(o => o.status === 'cancelled').length, activeBg: 'bg-red-600 text-white', activeShadow: 'shadow-red-600/30' },
                    { value: 'all', label: 'Сите', count: orders.length, activeBg: 'bg-jumbo-blue text-white', activeShadow: 'shadow-blue-900/30' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setFilter(tab.value)}
                        className={`relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-200 whitespace-nowrap ${filter === tab.value
                            ? `${tab.activeBg} shadow-md ${tab.activeShadow} transform scale-105`
                            : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 shadow-sm'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-[1.25rem] px-1.5 rounded-full text-[0.6875rem] font-bold ${filter === tab.value
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-200 text-gray-700'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-lg">Нема нарачки</p>
                </div>
            ) : (
                <div className="space-y-4 md:space-y-6">
                    {filtered.map(order => {
                        const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const isExpanded = expandedId === order.id;
                        const date = new Date(order.created_at);

                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {/* Header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                    className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 text-left">
                                        <div className={`inline-flex items-center w-fit gap-1.5 px-3 py-1.5 rounded-full text-xs md:text-sm font-bold border ${config.color}`}>
                                            {config.icon}
                                            {config.label}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-base md:text-lg">{order.customer_name}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {date.toLocaleDateString('mk-MK')} · {date.toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 shrink-0 pl-4">
                                        <span className="font-black text-jumbo-blue text-lg md:text-xl">{formatPrice(order.total)} ден</span>
                                        <div className={`p-2 rounded-full ${isExpanded ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 p-5 md:p-6 space-y-5 md:space-y-6 bg-gray-50/50">
                                        {/* Customer Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
                                            <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="p-2 bg-blue-50 text-jumbo-blue rounded-lg">
                                                    <Phone size={18} />
                                                </div>
                                                <a href={`tel:${order.customer_phone}`} className="font-medium hover:text-jumbo-blue transition-colors">{order.customer_phone}</a>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="p-2 bg-blue-50 text-jumbo-blue rounded-lg">
                                                    <MapPin size={18} />
                                                </div>
                                                <span className="font-medium">{order.delivery_address}, {order.delivery_city}</span>
                                            </div>
                                        </div>

                                        {order.note && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm md:text-base text-yellow-800 shadow-sm flex items-start gap-3">
                                                <span className="text-xl leading-none pt-0.5">💬</span>
                                                <div className="font-medium">{order.note}</div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 shadow-sm">
                                            <p className="text-sm md:text-base font-bold text-gray-800 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Артикли во нарачката</p>
                                            <div className="space-y-3">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-center text-sm md:text-base bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                                                        <span className="text-gray-800 font-medium">
                                                            <span className="inline-block bg-white border border-gray-200 rounded-md px-2 py-0.5 mr-3 text-gray-600 font-bold">{item.quantity}x</span>
                                                            {item.name}
                                                        </span>
                                                        <span className="font-bold text-gray-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)} ден</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center text-sm md:text-base">
                                                <span className="text-gray-600 font-medium flex items-center gap-2">
                                                    <Truck size={16} className="text-gray-400" />
                                                    Испорака
                                                </span>
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs md:text-sm font-semibold italic">По договор</span>
                                            </div>
                                        </div>

                                        {/* Status Change */}
                                        <div className="mt-6 bg-white rounded-xl p-5 md:p-6 border border-gray-100 shadow-sm">
                                            <p className="text-base md:text-lg font-bold text-gray-900 mb-4">Промени статус на нарачка:</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
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
                                                            className={`flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${isCurrent
                                                                ? sc.color + ' border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] cursor-default ring-4 ring-white ring-offset-1'
                                                                : 'bg-white border-gray-200 text-gray-600 shadow-sm hover:border-jumbo-blue hover:text-jumbo-blue hover:shadow-md hover:-translate-y-1'
                                                                }`}
                                                        >
                                                            {s === 'pending' && <Package size={isCurrent ? 24 : 20} className={isCurrent ? 'opacity-100' : 'opacity-70'} />}
                                                            {s === 'shipped' && <Truck size={isCurrent ? 24 : 20} className={isCurrent ? 'opacity-100' : 'opacity-70'} />}
                                                            {s === 'delivered' && <CheckCircle size={isCurrent ? 24 : 20} className={isCurrent ? 'opacity-100' : 'opacity-70'} />}
                                                            {s === 'cancelled' && <XCircle size={isCurrent ? 24 : 20} className={isCurrent ? 'opacity-100' : 'opacity-70'} />}
                                                            <span className={`text-xs md:text-sm font-bold ${isCurrent ? 'scale-110' : ''}`}>{sc.label}</span>
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
