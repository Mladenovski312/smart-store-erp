import { LogOut } from 'lucide-react';

export default function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogOut className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Одјави се?</h3>
          <p className="text-sm text-gray-500 mt-1">Дали сте сигурни дека сакате да се одјавите?</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            Не
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
          >
            Да, одјави се
          </button>
        </div>
      </div>
    </div>
  );
}
