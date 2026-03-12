import { BarChart3 } from 'lucide-react';
import { SaleRecord } from '@/lib/types';

export default function SalesHistory({ sales }: { sales: SaleRecord[] }) {
  const sorted = [...sales].sort((a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime());

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        <BarChart3 className="text-gray-300 w-14 h-14 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Нема продажби</h3>
        <p className="text-gray-500 max-w-sm mt-2">Продажбите ќе се појават тука откако ќе регистрирате продажба од инвентарот.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Артикл</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Кол.</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Цена</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Профит</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Датум</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{sale.productName}</td>
                <td className="px-4 py-4 text-sm text-center text-gray-600">{sale.quantitySold}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">{sale.soldPrice.toLocaleString()} ден</td>
                <td className="px-6 py-4 text-sm text-right text-green-600 font-semibold">+{sale.profit.toLocaleString()} ден</td>
                <td className="px-6 py-4 text-sm text-right text-gray-500">
                  {new Date(sale.soldAt).toLocaleDateString('mk-MK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
