import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import Footer from '@/components/Footer';

interface OrderCompleteProps {
    orderId: string;
}

export default function OrderComplete({ orderId }: OrderCompleteProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-16">
                        <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                            ИНТЕР СТАР <span className="text-red-300">ЏАМБО</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                        <span className="text-green-500">КОШНИЧКА <Check className="inline w-3.5 h-3.5 mb-0.5" /></span>
                        <span className="text-gray-300">&rarr;</span>
                        <span className="text-green-500">НАРАЧКА <Check className="inline w-3.5 h-3.5 mb-0.5" /></span>
                        <span className="text-gray-300">&rarr;</span>
                        <span className="text-jumbo-blue">ГОТОВО</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">Нарачката е примена!</h1>
                    <p className="text-gray-600 mb-2">
                        Ви благодариме за вашата нарачка. Ќе ве контактираме наскоро за потврда и детали за испораката.
                    </p>
                    {orderId && (
                        <p className="text-xs text-gray-400 mb-8">Нарачка: #{orderId.slice(0, 8).toUpperCase()}</p>
                    )}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors"
                    >
                        <ShoppingBag size={18} />
                        Назад на почетна
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
}
