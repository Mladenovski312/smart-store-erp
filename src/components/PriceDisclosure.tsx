export const PRICE_DISCLOSURE_TEXT =
    'Цените се со вклучен ДДВ. Испораката не е вклучена.';

export const DELIVERY_DISCLOSURE_TEXT =
    'Трошоците за испорака не се вклучени во цената и ќе бидат договорени при контакт за нарачка.';

export default function PriceDisclosure({ className = '' }: { className?: string }) {
    return (
        <p className={`text-[0.6875rem] leading-snug text-gray-500 ${className}`}>
            {PRICE_DISCLOSURE_TEXT}
        </p>
    );
}
