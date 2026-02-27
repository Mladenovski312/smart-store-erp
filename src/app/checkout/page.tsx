"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ShoppingBag, Check, CreditCard } from 'lucide-react';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cart';
import { MK_CITIES } from '@/lib/cities';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
    const [mounted, setMounted] = useState(false);
    const [items, setItems] = useState<CartItem[]>([]);

    // Form
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [street, setStreet] = useState('');
    const [note, setNote] = useState('');
    const [createAccount, setCreateAccount] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // State
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState('');

    const cityRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
        setItems(getCart());

        // Try to auto-fill from saved customer
        const saved = localStorage.getItem('jumbo_customer');
        if (saved) {
            try {
                const c = JSON.parse(saved);
                setFirstName(c.firstName || '');
                setLastName(c.lastName || '');
                setEmail(c.email || '');
                setPhone(c.phone || '');
                setCity(c.city || '');
                setCitySearch(c.city || '');
                setStreet(c.street || '');
            } catch { /* ignore */ }
        }

        window.addEventListener('cart-updated', () => setItems(getCart()));

        // Close city dropdown on outside click
        const handleClick = (e: MouseEvent) => {
            if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredCities = MK_CITIES.filter(c =>
        c.toLowerCase().includes(citySearch.toLowerCase())
    ).slice(0, 12);

    const subtotal = getCartTotal();

    const validate = (): string[] => {
        const errs: string[] = [];
        if (!firstName.trim()) errs.push('Внесете го вашето име.');
        if (!lastName.trim()) errs.push('Внесете го вашето презиме.');
        if (!email.trim() || !email.includes('@')) errs.push('Внесете валидна е-маил адреса.');
        if (!phone.trim() || phone.replace(/\D/g, '').length < 8) errs.push('Внесете валиден телефонски број.');
        if (!city.trim()) errs.push('Одберете град/општина.');
        if (!street.trim()) errs.push('Внесете ја вашата улица.');
        if (!acceptTerms) errs.push('Мора да ги прифатите условите.');
        if (items.length === 0) errs.push('Кошничката е празна.');
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (errs.length > 0) { setErrors(errs); return; }
        setErrors([]);
        setSubmitting(true);

        try {
            // 1. Handle customer creation / lookup
            let customerId: string | null = null;

            if (createAccount) {
                // Check if customer exists
                const { data: existing } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('email', email.trim().toLowerCase())
                    .maybeSingle();

                if (existing) {
                    customerId = existing.id;
                    // Update their info
                    await supabase.from('customers').update({
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        phone: phone.trim(),
                        city: city.trim(),
                        street: street.trim(),
                    }).eq('id', customerId);
                } else {
                    const { data: newCust } = await supabase
                        .from('customers')
                        .insert({
                            first_name: firstName.trim(),
                            last_name: lastName.trim(),
                            email: email.trim().toLowerCase(),
                            phone: phone.trim(),
                            city: city.trim(),
                            street: street.trim(),
                        })
                        .select('id')
                        .single();
                    if (newCust) customerId = newCust.id;
                }
            }

            // Save customer info locally for auto-fill
            localStorage.setItem('jumbo_customer', JSON.stringify({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                city: city.trim(),
                street: street.trim(),
            }));

            // 2. Create order
            const orderData = {
                customer_name: `${firstName.trim()} ${lastName.trim()}`,
                customer_first_name: firstName.trim(),
                customer_last_name: lastName.trim(),
                customer_email: email.trim().toLowerCase(),
                customer_phone: phone.trim(),
                delivery_city: city.trim(),
                delivery_address: street.trim(),
                note: note.trim() || null,
                customer_id: customerId,
                items: items.map(i => ({
                    productId: i.productId,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    imageUrl: i.imageUrl,
                })),
                subtotal,
                total: subtotal,
                status: 'pending',
                payment_method: 'cod',
            };

            const { data: order, error } = await supabase
                .from('orders')
                .insert(orderData)
                .select('id')
                .single();

            if (error) throw error;

            setOrderId(order?.id || '');
            clearCart();
            setOrderComplete(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Send confirmation email (fire-and-forget)
            if (order?.id) {
                fetch('/api/emails/order-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: order.id,
                        customerName: `${firstName.trim()} ${lastName.trim()}`,
                        customerEmail: email.trim().toLowerCase(),
                        items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
                        subtotal,
                        deliveryAddress: street.trim(),
                        deliveryCity: city.trim(),
                    }),
                }).catch(() => { /* email failure shouldn't affect order */ });
            }
        } catch (err) {
            console.error(err);
            setErrors(['Настана грешка при испраќање на нарачката. Обидете се повторно.']);
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ═══ Order Complete State ═══
    if (orderComplete) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center h-16">
                            <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                                ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                            </Link>
                        </div>
                    </div>
                </nav>

                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-3xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                            <span className="text-green-500">КОШНИЧКА ✓</span>
                            <span className="text-gray-300">→</span>
                            <span className="text-green-500">CHECKOUT ✓</span>
                            <span className="text-gray-300">→</span>
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

    // ═══ Checkout Form ═══
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/kosnicka" className="flex items-center gap-2 text-gray-500 hover:text-jumbo-blue transition-colors">
                            <ChevronLeft size={20} />
                            <span className="text-sm font-medium hidden sm:inline">Кошничка</span>
                        </Link>
                        <Link href="/" className="bg-jumbo-blue text-white px-2.5 py-1 rounded-lg font-black text-sm tracking-tight">
                            ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                        </Link>
                        <div className="w-20" />
                    </div>
                </div>
            </nav>

            {/* Progress Stepper */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                        <span className="text-green-500">КОШНИЧКА ✓</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-jumbo-blue">CHECKOUT</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-gray-400">ГОТОВО</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                        <ul className="text-sm space-y-1 list-disc list-inside">
                            {errors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                    {/* ═══ Left: Form ═══ */}
                    <div>
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Info */}
                            <section className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-5">ПЛАЌАЊЕ & ИСПОРАКА</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Име *</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={e => setFirstName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none"
                                            placeholder="Вашето име"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Презиме *</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none"
                                            placeholder="Вашето презиме"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Е-маил адреса *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none"
                                        placeholder="vashiot@email.mk"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон *</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none"
                                        placeholder="07X XXX XXX"
                                    />
                                </div>

                                <div className="mt-4" ref={cityRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Град / Општина *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={citySearch}
                                            onChange={e => {
                                                setCitySearch(e.target.value);
                                                setCity('');
                                                setShowCityDropdown(true);
                                            }}
                                            onFocus={() => setShowCityDropdown(true)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none"
                                            placeholder="Пребарај град..."
                                        />
                                        {showCityDropdown && filteredCities.length > 0 && (
                                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                {filteredCities.map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => {
                                                            setCity(c);
                                                            setCitySearch(c);
                                                            setShowCityDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-jumbo-blue/5 hover:text-jumbo-blue transition-colors first:rounded-t-xl last:rounded-b-xl"
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Улица *</label>
                                    <input
                                        type="text"
                                        value={street}
                                        onChange={e => setStreet(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none"
                                        placeholder="Внесете ја вашата улична адреса"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Забелешка</label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/20 focus:border-jumbo-blue transition-all outline-none resize-none"
                                        placeholder="Дополнете доколку имате забелешка"
                                    />
                                </div>
                            </section>

                            {/* Account + Payment */}
                            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                                {/* Create Account */}
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createAccount}
                                        onChange={e => setCreateAccount(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-jumbo-blue focus:ring-jumbo-blue/20"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm text-gray-900">Креирај Корисничка сметка?</span>
                                        <p className="text-xs text-gray-500 mt-0.5">Зачувајте ги вашите податоци за побрза нарачка следниот пат.</p>
                                    </div>
                                </label>

                                <hr className="border-gray-100" />

                                {/* Payment */}
                                <div>
                                    <h3 className="font-bold text-sm text-gray-900 mb-3">Начин на плаќање</h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" checked readOnly className="w-4 h-4 text-jumbo-blue" />
                                            <div>
                                                <span className="font-semibold text-sm text-gray-900">ПЛАЌАЊЕ ПРИ ДОСТАВА</span>
                                                <p className="text-xs text-gray-500 mt-0.5">Плаќањето ќе биде извршено при подигнување на нарачката.</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Terms */}
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={e => setAcceptTerms(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-jumbo-blue focus:ring-jumbo-blue/20"
                                    />
                                    <span className="text-xs text-gray-600 leading-relaxed">
                                        Со прифаќање на{' '}
                                        <Link href="/uslovi-za-isporaka" className="text-jumbo-blue font-semibold hover:underline" target="_blank">
                                            правила и услови
                                        </Link>{' '}
                                        за креирање нарачка корисникот е согласен да биди контактиран по пат на телефонски повик, SMS, Viber, Email од страна на Интер Стар Џамбо за статус на нарачка.
                                    </span>
                                </label>
                            </section>

                            {/* Mobile submit */}
                            <button
                                type="submit"
                                disabled={submitting || items.length === 0}
                                className="lg:hidden w-full bg-jumbo-blue hover:bg-blue-800 text-white py-4 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Се испраќа...' : 'НАПРАВЕТЕ НАРАЧКА'}
                            </button>
                        </form>
                    </div>

                    {/* ═══ Right: Order Summary ═══ */}
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
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <ShoppingBag className="w-4 h-4 text-gray-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 font-medium line-clamp-2 leading-tight">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × {item.price.toLocaleString()} ден</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                            {(item.price * item.quantity).toLocaleString()} ден
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-100 pt-4 mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Меѓузбир</span>
                                    <span className="font-semibold">{subtotal.toLocaleString()} ден</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Испорака</span>
                                    <span className="text-xs text-gray-400 italic">По договор</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-baseline">
                                <span className="font-bold text-gray-900">Вкупно</span>
                                <span className="text-xl font-bold text-jumbo-blue">{subtotal.toLocaleString()} ден</span>
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
                </div>
            </div>

            <Footer />
        </div>
    );
}
