import { Tags } from 'lucide-react';
import { Product, formatPrice } from '@/lib/types';

export default function CategoriesView({ products }: { products: Product[] }) {
  const categoryMap = new Map<string, { count: number; value: number }>();
  for (const p of products) {
    const existing = categoryMap.get(p.category) || { count: 0, value: 0 };
    categoryMap.set(p.category, {
      count: existing.count + p.stockQuantity,
      value: existing.value + p.sellingPrice * p.stockQuantity,
    });
  }

  const entries = Array.from(categoryMap.entries()).sort((a, b) => b[1].count - a[1].count);
  const labels: Record<string, string> = {
    'Toys': 'Играчки',
    'Vehicles & Ride-ons': 'Возила и Автомобили',
    'Dolls & Figures': 'Кукли и Фигури',
    'Baby & Toddler': 'Опрема за Бебиња',
    'Outdoor & Sports': 'Спорт и Рекреација',
    'Games & Puzzles': 'Игри и Сложувалки',
    'Clothing & School': 'Облека и Училишно',
    'Разно (Miscellaneous)': 'Разно',
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center min-h-[18.75rem] flex flex-col items-center justify-center">
        <Tags className="text-gray-300 w-14 h-14 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Нема категории</h3>
        <p className="text-gray-500 max-w-sm mt-2">Категориите ќе се пополнат автоматски кога ќе додадете артикли.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([cat, data]) => (
        <div key={cat} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 mb-1">{labels[cat] || cat}</h3>
          <div className="text-2xl font-bold text-jumbo-blue">{data.count}</div>
          <div className="text-sm text-gray-500 mt-1">Вредност: {formatPrice(data.value)} ден</div>
        </div>
      ))}
    </div>
  );
}
