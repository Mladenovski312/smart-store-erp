import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Кошничка',
    description: 'Прегледајте ги артиклите во вашата кошничка пред да нарачате.',
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return children;
}
