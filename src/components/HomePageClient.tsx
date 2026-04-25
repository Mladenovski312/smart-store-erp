"use client";

import { useState } from 'react';
import React from 'react';
import { ShoppingBag, ChevronRight, ChevronDown, Truck, Plus, Car, Dices, Baby, Bike, PuzzleIcon, Backpack, Smile, Gift } from 'lucide-react';
import { addToCart, SHOP_DISABLED } from '@/lib/cart';
import { Product, CATEGORIES, getCategoryLabel, formatPrice } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import PriceDisclosure from '@/components/PriceDisclosure';

const BRANDS = [
    { name: 'LEGO', src: '/brands/lego.png' },
    { name: 'Bruder', src: '/brands/bruder.png' },
    { name: 'Clementoni', src: '/brands/clementoni.png' },
    { name: 'Kikka Boo', src: '/brands/kikkaboo.png' },
    { name: 'Barbie', src: '/brands/barbie.svg' },
    { name: 'Paw Patrol', src: '/brands/pawpatrol.webp' },
    { name: 'Nip', src: '/brands/nip.png' },
];

const faqs = [
    {
        q: "Како се плаќа при онлајн нарачка?",
        a: "Сите онлајн нарачки се плаќаат исклучиво при достава, готовински на курирот при преземање на пратката. Не е потребна картичка ниту претплата, што ви гарантира целосно безбедно купување."
    },
    {
        q: "Кои брендови на играчки ги продавате?",
        a: "Нудиме оригинални играчки од светски познати брендови: LEGO, Barbie, Bruder, Clementoni, Paw Patrol, Kikka Boo, Nip и многу други. Целиот асортиман можете да го разгледате во нашиот онлајн каталог."
    },
    {
        q: "Дали доставувате низ цела Македонија?",
        a: "Да, вршиме достава на играчки низ целата територија на Македонија. Нашата физичка продавница се наоѓа во Куманово, но преку онлајн продавницата нарачката стигнува безбедно до вашата врата."
    },
    {
        q: "Дали нудите украсно пакување?",
        a: "Да, нудиме бесплатно украсно пакување. Доволно е да напоменете во забелешката при креирање на нарачката."
    },
    {
        q: "Кое е работното време на продавницата во Куманово?",
        a: "Продавницата Интер Стар Џамбо на ул. Народна Револуција 30-4 во Куманово е отворена од понеделник до сабота, од 09:00 до 21:00 часот. Во недела не работиме."
    },
    {
        q: "Како да нарачам играчки онлајн?",
        a: "Изберете ги саканите производи од нашиот онлајн каталог, додадете ги во кошничката и пополнете ги податоците за достава. Нарачувате брзо и едноставно, 24 часа на ден."
    }
];

export default function HomePageClient({ initialProducts }: { initialProducts: Product[] }) {
    const featured = initialProducts.slice(0, 8);
    const categoryGroups = CATEGORIES.map(c => ({
        ...c,
        count: initialProducts.filter(p => p.category === c.value).length,
    }));

    return (
        <>
            {/* Categories Grid */}
            <section id="categories" className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Категории</h2>
                        <p className="text-gray-500 max-w-md mx-auto">Разгледајте ги нашите категории и пронајдете ја совршената играчка.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryGroups.map(cat => {
                            if (cat.count === 0) {
                                return (
                                    <div
                                        key={cat.value}
                                        className="group relative bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center select-none"
                                    >
                                        <div className="mb-3 text-gray-300">{getCategoryIcon(cat.value)}</div>
                                        <h3 className="font-semibold text-gray-600 mb-1">{cat.label}</h3>
                                        <span className="bg-gray-300 text-gray-700 text-[0.625rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2">Набрзо достапно</span>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={cat.value}
                                    href={`/catalog?category=${encodeURIComponent(cat.value)}`}
                                    className="group relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-jumbo-blue/20 hover:-translate-y-1 transition-all flex flex-col items-center justify-center text-center cursor-pointer"
                                >
                                    <div className="mb-3 text-jumbo-blue/70 group-hover:text-jumbo-blue transition-colors">{getCategoryIcon(cat.value)}</div>
                                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-jumbo-blue transition-colors">{cat.label}</h3>
                                    <p className="text-sm text-gray-500">{cat.count} артикли</p>
                                    <ChevronRight className="absolute top-6 right-5 w-4 h-4 text-gray-300 group-hover:text-jumbo-blue group-hover:translate-x-1 transition-all" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {featured.length > 0 && (
                <section id="products" className="py-16 md:py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Избрани производи</h2>
                                <p className="text-gray-500">Дел од асортиманот што го подготвуваме за онлајн каталогот.</p>
                            </div>
                            <Link
                                href="/catalog"
                                className="hidden md:flex items-center gap-1 text-jumbo-blue font-semibold hover:gap-2 transition-all"
                            >
                                Сите <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {featured.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-jumbo-blue text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-sm"
                            >
                                Види ги сите артикли
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Top Brands */}
            <section className="py-14 md:py-20 border-b border-gray-100 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide uppercase">ВРВНИ БРЕНДОВИ</h2>
                </div>

                <div className="relative flex overflow-hidden group py-4">
                    <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    {[1, 2].map(copy => (
                        <div key={copy} className="flex min-w-full shrink-0 items-center justify-around gap-20 px-8 animate-marquee group-hover:[animation-play-state:paused]" aria-hidden={copy === 2}>
                            {BRANDS.map((brand, i) => (
                                <div key={`${brand.name}-${copy}-${i}`} className="inline-flex items-center justify-center h-28 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300">
                                    <Image src={brand.src} alt={brand.name} width={192} height={96} className="max-h-24 max-w-[12rem] object-contain" loading="lazy" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* Delivery Banner */}
            <section className="py-12 md:py-16 bg-gradient-to-r from-jumbo-blue via-blue-700 to-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-3 backdrop-blur-sm">
                                <Truck size={16} />
                                Нарачај онлајн
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Достава низ цела Македонија</h3>
                            <p className="text-blue-200 max-w-lg">
                                Нарачајте ја вашата омилена играчка и ние ќе ви ја испорачаме на вашата адреса. Плаќање при достава.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/catalog"
                                className="inline-flex items-center gap-2 bg-white text-jumbo-blue px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                <ShoppingBag size={18} />
                                Купувај онлајн
                            </Link>
                            <Link
                                href="/uslovi-za-isporaka"
                                className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20"
                            >
                                Услови →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">За Интер Стар Џамбо</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Со над 20 години искуство, <strong>Интер Стар Џамбо</strong> е една од најпознатите
                            продавници за играчки во Куманово. Нашата мисија е да донесеме радост на секое
                            дете преку широк избор на играчки од познати светски брендови.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['LEGO', 'Barbie', 'Paw Patrol', 'Bruder', 'Clementoni', 'Kikka Boo'].map(brand => (
                                <span key={brand} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                                    {brand}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Accordion Section */}
            <section className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Често поставувани прашања</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <FaqItem key={i} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

// Sub-components

function ProductCard({ product }: { product: Product }) {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.sellingPrice,
            imageUrl: product.imageUrl,
            stock: product.stockQuantity,
        });
    };

    return (
        <Link href={`/produkt/${product.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden p-2 relative">
                {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className={`object-contain transition-transform duration-300 p-2 ${product.stockQuantity > 0 ? 'group-hover:scale-105' : 'opacity-90'}`} />
                ) : (
                    <div className={`text-5xl font-bold text-gray-200 ${product.stockQuantity <= 0 ? 'opacity-80' : ''}`}>{product.name.charAt(0)}</div>
                )}
                {product.stockQuantity <= 0 && (
                    <div className="absolute inset-0 bg-white/20 flex flex-col items-center justify-center z-10 pointer-events-none">
                        <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg border border-gray-700 backdrop-blur-md">Нема залиха</span>
                    </div>
                )}
            </div>
            <div className={`p-2.5 sm:p-3 ${product.stockQuantity <= 0 ? 'opacity-80' : ''}`}>
                <p className="text-xs text-gray-500 mb-0.5 truncate">{getCategoryLabel(product.category)}</p>
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 mb-2 min-h-[2rem]">{product.name}</h3>
                <div className="flex items-center justify-between mb-2 gap-1 flex-wrap">
                    <span className={`text-sm sm:text-base font-bold leading-none ${product.stockQuantity > 0 ? 'text-jumbo-blue' : 'text-gray-500'}`}>
                        {formatPrice(product.sellingPrice)}<span className="text-xs font-normal text-gray-500 ml-0.5">ден</span>
                    </span>
                    {product.stockQuantity <= 0 && (
                        <span className="text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            Нема залиха
                        </span>
                    )}
                </div>
                <PriceDisclosure className="mb-2" />
                <button
                    onClick={handleAddToCart}
                    disabled={SHOP_DISABLED || product.stockQuantity <= 0}
                    className={`w-full flex items-center justify-center gap-1 min-h-[2.75rem] py-2.5 rounded-lg text-xs font-bold transition-all ${SHOP_DISABLED
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : product.stockQuantity > 0
                            ? 'bg-jumbo-red text-white hover:bg-red-700 active:scale-95'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Plus size={13} />
                    {SHOP_DISABLED ? 'Сè уште недостапно' : product.stockQuantity > 0 ? 'Додај во кошничка' : 'Нема залиха'}
                </button>
            </div>
        </Link>
    );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                aria-expanded={open}
            >
                <h3 className="text-base font-bold text-gray-900 pr-4">{question}</h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`grid transition-all duration-200 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
            >
                <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-gray-600">{answer}</p>
                </div>
            </div>
        </div>
    );
}

function getCategoryIcon(category: string): React.ReactNode {
    const map: Record<string, React.ReactNode> = {
        'Vehicles & Ride-ons': <Car className="w-7 h-7" />,
        'Dolls & Figures': <Smile className="w-7 h-7" />,
        'Baby & Toddler': <Baby className="w-7 h-7" />,
        'Outdoor & Sports': <Bike className="w-7 h-7" />,
        'Games & Puzzles': <PuzzleIcon className="w-7 h-7" />,
        'Clothing & School': <Backpack className="w-7 h-7" />,
        'Играчки': <Dices className="w-7 h-7" />,
        'Разно (Miscellaneous)': <Gift className="w-7 h-7" />,
    };
    return map[category] ?? <ShoppingBag className="w-7 h-7" />;
}
