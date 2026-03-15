"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cart';
import { MK_CITIES } from '@/lib/cities';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { latinToCyrillic } from '@/lib/search';
import OrderComplete from '@/components/checkout/OrderComplete';
import OrderSummary from '@/components/checkout/OrderSummary';

export default function CheckoutPage() {
    const [items, setItems] = useState<CartItem[]>(() => getCart());

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
    const [saveData, setSaveData] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // State
    const [errors, setErrors] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState('');

    const cityRef = useRef<HTMLDivElement>(null);
    const submittingRef = useRef(false);
    const supabase = createClient();

    useEffect(() => {
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
                setSaveData(true);
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
        if (phone.length !== 8) errs.push('Внесете валиден телефонски број (8 цифри по +389).');
        if (!city.trim()) errs.push('Одберете град/општина.');
        if (!street.trim()) errs.push('Внесете ја вашата улица.');
        if (!acceptTerms) errs.push('Мора да ги прифатите условите.');
        if (items.length === 0) errs.push('Кошничката е празна.');
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submittingRef.current) return;
        const errs = validate();
        if (errs.length > 0) { setErrors(errs); return; }
        setErrors([]);
        submittingRef.current = true;
        setSubmitting(true);

        try {
            // Save or clear customer info locally based on consent
            if (saveData) {
                localStorage.setItem('jumbo_customer', JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    city: city.trim(),
                    street: street.trim(),
                }));
            } else {
                localStorage.removeItem('jumbo_customer');
            }

            // Atomic checkout: deduct stock + verify prices + create order in one DB transaction
            const generatedOrderId = crypto.randomUUID();
            const { data: orderResult, error: orderError } = await supabase.rpc('create_order_atomic', {
                p_order_id: generatedOrderId,
                p_items: items.map(i => ({ id: i.productId, quantity: i.quantity, name: i.name, imageUrl: i.imageUrl })),
                p_customer_name: `${firstName.trim()} ${lastName.trim()}`,
                p_customer_first_name: firstName.trim(),
                p_customer_last_name: lastName.trim(),
                p_customer_email: email.trim().toLowerCase(),
                p_customer_phone: `+389${phone}`,
                p_delivery_city: city.trim(),
                p_delivery_address: street.trim(),
                p_note: note.trim() || null,
                p_payment_method: 'cod',
            });

            if (orderError) {
                const msg = orderError.message || '';
                if (msg.includes('Not enough stock')) {
                    setErrors(['Еден или повеќе производи не се достапни во бараната количина. Проверете ја вашата кошничка и обидете се повторно.']);
                } else {
                    setErrors(['Настана грешка при испраќање на нарачката. Обидете се повторно.']);
                }
                return;
            }

            // The RPC returns verified items and subtotal (with real DB prices)
            const verifiedItems: { productId: string; name: string; price: number; quantity: number; imageUrl?: string }[] =
                orderResult?.items || items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity }));
            const verifiedSubtotal: number = orderResult?.subtotal || subtotal;

            setOrderId(generatedOrderId);
            clearCart();
            setOrderComplete(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Send confirmation email (fire-and-forget) — uses verified prices
            if (generatedOrderId) {
                fetch('/api/emails/order-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: generatedOrderId,
                        customerName: `${firstName.trim()} ${lastName.trim()}`,
                        customerEmail: email.trim().toLowerCase(),
                        items: verifiedItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
                        subtotal: verifiedSubtotal,
                        deliveryAddress: street.trim(),
                        deliveryCity: city.trim(),
                    }),
                }).catch(() => { /* email failure shouldn't affect order */ });
            }
        } catch (err) {
            console.error(err);
            setErrors(['Настана грешка при испраќање на нарачката. Обидете се повторно.']);
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    // ═══ Order Complete State ═══
    if (orderComplete) {
        return <OrderComplete orderId={orderId} />;
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
                            ИНТЕР СТАР <span className="text-red-300">ЏАМБО</span>
                        </Link>
                        <div className="w-20" />
                    </div>
                </div>
            </nav>

            {/* Progress Stepper */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                        <span className="text-green-500">КОШНИЧКА <Check className="inline w-3.5 h-3.5 mb-0.5" /></span>
                        <span className="text-gray-300">&rarr;</span>
                        <span className="text-jumbo-blue">CHECKOUT</span>
                        <span className="text-gray-300">&rarr;</span>
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

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_23.75rem] gap-8">
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
                                            autoComplete="given-name"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/50 focus:border-jumbo-blue transition-all outline-none"
                                            placeholder="Вашето име"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Презиме *</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={e => setLastName(e.target.value)}
                                            autoComplete="family-name"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/50 focus:border-jumbo-blue transition-all outline-none"
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
                                        autoComplete="email"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/50 focus:border-jumbo-blue transition-all outline-none"
                                        placeholder="vashiot@email.mk"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон *</label>
                                    <div className="flex rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-jumbo-blue/50 focus-within:border-jumbo-blue transition-all bg-white">
                                        <div className="bg-gray-50 text-gray-500 font-medium px-4 py-3 border-r border-gray-200 flex items-center shrink-0">
                                            +389
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                            autoComplete="tel-national"
                                            className="w-full px-4 py-3 text-sm outline-none bg-transparent"
                                            placeholder="7X XXX XXX"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4" ref={cityRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Град / Општина *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={citySearch}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const transliterated = latinToCyrillic(val);
                                                setCitySearch(transliterated);
                                                setCity('');
                                                setShowCityDropdown(true);
                                            }}
                                            onFocus={() => setShowCityDropdown(true)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/50 focus:border-jumbo-blue transition-all outline-none"
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
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-jumbo-blue/5 hover:text-jumbo-blue transition-colors first:rounded-t-xl last:rounded-b-xl cursor-pointer"
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
                                        autoComplete="street-address"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/50 focus:border-jumbo-blue transition-all outline-none"
                                        placeholder="Внесете ја вашата улична адреса"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Забелешка</label>
                                    <textarea
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-jumbo-blue/50 focus:border-jumbo-blue transition-all outline-none resize-none"
                                        placeholder="Дополнете доколку имате забелешка"
                                    />
                                </div>
                            </section>

                            {/* Account + Payment */}
                            <section className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                                {/* Save Data Consent */}
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={saveData}
                                        onChange={e => setSaveData(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-jumbo-blue focus:ring-jumbo-blue/20"
                                    />
                                    <div>
                                        <span className="font-semibold text-sm text-gray-900">Зачувај ги моите податоци</span>
                                        <p className="text-xs text-gray-500 mt-0.5">Вашите податоци ќе бидат зачувани за побрза нарачка следниот пат од истиот уред</p>
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
                                        </Link>{' '}и{' '}
                                        <Link href="/politika-za-vrakanje" className="text-jumbo-blue font-semibold hover:underline" target="_blank">
                                            политика за враќање
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
                    <OrderSummary items={items} subtotal={subtotal} submitting={submitting} />
                </div>
            </div>

            <Footer />
        </div>
    );
}
