import { ShoppingBag } from 'lucide-react';
import { CartItem } from '@/lib/cart';
import { formatPrice } from '@/lib/types';
import Image from 'next/image';
import { DELIVERY_DISCLOSURE_TEXT, PRICE_DISCLOSURE_TEXT } from '@/components/PriceDisclosure';

interface OrderSummaryProps {
    items: CartItem[];
    subtotal: number;
    submitting: boolean;
}

export default function OrderSummary({ items, subtotal, submitting }: OrderSummaryProps) {
    return (
        <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">ВАШАТА НАРАЧКА</h2>

                {/* Header */}
                <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-100">
                    <span>Продукт</span>
                    <span>Меѓузбир</span>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50">
                    {items.map(item => (
                        <div key={item.productId} className="flex gap-3 py-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                {item.imageUrl ? (
                                    <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-contain p-0.5" />
                                ) : (
                                    <ShoppingBag className="w-4 h-4 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 font-medium line-clamp-2 leading-tight">{item.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × {formatPrice(item.price)} ден</p>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                {formatPrice(item.price * item.quantity)} ден
                            </span>
                        </div>
                    ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Меѓузбир</span>
                        <span className="font-semibold">{formatPrice(subtotal)} ден</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Испорака</span>
                        <span className="text-xs text-gray-400 italic">Не е вклучена</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {PRICE_DISCLOSURE_TEXT} {DELIVERY_DISCLOSURE_TEXT}
                    </p>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">Вкупно</span>
                    <span className="text-xl font-bold text-jumbo-blue">{formatPrice(subtotal)} ден</span>
                </div>

                {/* Desktop submit */}
                <button
                    type="submit"
                    form="checkout-form"
                    disabled={submitting || items.length === 0}
                    className="hidden lg:block w-full mt-5 bg-jumbo-blue hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? 'Се испраќа...' : 'НАПРАВЕТЕ НАРАЧКА'}
                </button>
            </div>
        </div>
    );
}
