import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Нарачка',
    description: 'Завршете ја вашата нарачка. Испораката не е вклучена во цената и се договара при контакт.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
