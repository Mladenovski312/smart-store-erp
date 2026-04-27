import type { Metadata } from 'next';
import { getProducts } from '@/lib/store';
import { ShoppingBag, MapPin, Gift, Truck, Star, Shield } from 'lucide-react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import HomePageClient from '@/components/HomePageClient';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
    title: 'Интер Стар Џамбо | Играчки Куманово',
    description: 'Најдобриот избор на играчки во Куманово. Каталогот, цените и онлајн нарачките се во подготовка.',
};

export const revalidate = 60;

const faqs = [
    {
        q: "Како се плаќа при онлајн нарачка?",
        a: "Онлајн нарачките сè уште не се активни. Каталогот е во подготовка додека ги усогласуваме правните информации и процесот за нарачување."
    },
    {
        q: "Кои брендови на играчки ги продавате?",
        a: "Нудиме оригинални играчки од светски познати брендови: LEGO, Barbie, Bruder, Clementoni, Paw Patrol, Kikka Boo, Nip и многу други. Целиот асортиман можете да го разгледате во нашиот онлајн каталог."
    },
    {
        q: "Дали доставувате низ цела Македонија?",
        a: "Условите за достава се во подготовка и ќе бидат јасно објавени пред активирање на онлајн нарачките. Физичката продавница се наоѓа во Куманово."
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
        a: "Онлајн нарачките се во подготовка. Производите моментално може да се разгледуваат како каталог, а нарачување ќе биде овозможено откако ќе бидат објавени сите потребни услови и правни информации."
    }
];

export default async function Home() {
    const products = await getProducts();

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <NavBar products={products} />

            <main className="relative z-0">
                {/* Hero Section — server-rendered for fast LCP */}
                <section className="relative overflow-hidden bg-gradient-to-br from-jumbo-blue via-blue-800 to-indigo-900">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-jumbo-red rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                                <Gift size={14} />
                                Над 20 години радост за децата
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-lg">
                                Најдобриот избор на играчки во <span className="text-jumbo-red">Куманово</span>
                            </h1>
                            <p className="text-lg md:text-xl text-blue-50 mb-10 leading-relaxed font-medium max-w-xl drop-shadow">
                                Не сме најголемата продавница, но сме најдобриот избор. Каталогот, цените и онлајн нарачките се во подготовка.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/catalog"
                                    className="bg-jumbo-red hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 text-center shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={22} />
                                    Погледни ги играчките
                                </Link>
                                <Link
                                    href="/lokacija"
                                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 backdrop-blur-sm"
                                >
                                    <MapPin size={22} />
                                    Најди не
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Badges — server-rendered */}
                <section className="border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <TrustBadge icon={<Truck />} title="Достава низ МК" subtitle="Испорака до врата" />
                            <TrustBadge icon={<Star />} title="20+ години искуство" subtitle="Од 2004 година" />
                            <TrustBadge icon={<Shield />} title="Познати брендови" subtitle="Широк асортиман" />
                            <TrustBadge icon={<Gift />} title="Подарок пакување" subtitle="Бесплатно, по желба" />
                        </div>
                    </div>
                </section>

                {/* Interactive sections (categories, products, brands, delivery, about, FAQ) */}
                <HomePageClient initialProducts={products} />

                <Footer />
            </main>

            {/* Structured Data (JSON-LD) for AEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "ToyStore",
                                "@id": "https://interstarjumbo.com/#store",
                                "name": "Интер Стар Џамбо",
                                "alternateName": "Inter Star Jumbo",
                                "description": "Најдобриот избор на играчки во Куманово.",
                                "image": "https://www.interstarjumbo.com/hd_logo.webp",
                                "url": "https://interstarjumbo.com",
                                "telephone": "+38931422656",
                                "email": "info@interstarjumbo.mk",
                                "foundingDate": "2004",
                                "address": {
                                    "@type": "PostalAddress",
                                    "streetAddress": "Народна Револуција 30-4",
                                    "addressLocality": "Куманово",
                                    "postalCode": "1300",
                                    "addressCountry": "MK"
                                },
                                "geo": {
                                    "@type": "GeoCoordinates",
                                    "latitude": 42.1322,
                                    "longitude": 21.7144
                                },
                                "openingHoursSpecification": [
                                    {
                                        "@type": "OpeningHoursSpecification",
                                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                                        "opens": "09:00",
                                        "closes": "21:00"
                                    }
                                ],
                                "currenciesAccepted": "MKD"
                            },
                            {
                                "@type": "WebSite",
                                "@id": "https://interstarjumbo.com/#website",
                                "url": "https://interstarjumbo.com",
                                "name": "Интер Стар Џамбо",
                                "potentialAction": {
                                    "@type": "SearchAction",
                                    "target": "https://interstarjumbo.com/catalog?q={search_term_string}",
                                    "query-input": "required name=search_term_string"
                                }
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": faqs.map(faq => ({
                                    "@type": "Question",
                                    "name": faq.q,
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": faq.a
                                    }
                                }))
                            }
                        ]
                    })
                }}
            />
        </div>
    );
}

function TrustBadge({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-50 text-jumbo-blue rounded-xl flex items-center justify-center shrink-0 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                {icon}
            </div>
            <div className="min-w-0">
                <div className="font-bold text-gray-900 text-xs sm:text-base leading-tight">{title}</div>
                <div className="text-[0.6875rem] sm:text-sm text-gray-500 leading-tight mt-0.5">{subtitle}</div>
            </div>
        </div>
    );
}
