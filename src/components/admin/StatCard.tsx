export default function StatCard({ title, value, change, highlight = false }: { title: string; value: string; change: string; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border ${highlight ? 'bg-jumbo-blue-light border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}>
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <div className={`text-2xl font-bold ${highlight ? 'text-jumbo-blue' : 'text-gray-900'}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-2 font-medium">{change}</div>
    </div>
  );
}
