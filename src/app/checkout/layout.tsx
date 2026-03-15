import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Нарачка',
    description: 'Завршете ја вашата нарачка. Бесплатна достава и плаќање при достава.',
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
