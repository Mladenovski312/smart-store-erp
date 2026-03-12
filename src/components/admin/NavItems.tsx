import React from 'react';

export function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 rounded-lg transition-colors text-left ${active ? 'bg-white/10 text-white font-semibold' : 'text-indigo-100 hover:bg-white/5 hover:text-white font-medium'}`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
}

export function MobileNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 px-1 transition-colors ${active ? 'text-jumbo-blue font-bold scale-105 transform' : 'text-gray-500 hover:text-gray-900'}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] sm:text-xs tracking-tight">{label}</span>
    </button>
  );
}

export function MobileDrawerItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-4 rounded-xl transition-colors text-left ${active ? 'bg-jumbo-blue/10 text-jumbo-blue font-bold' : 'text-gray-700 hover:bg-gray-50 font-medium'}`}
    >
      <span className={`mr-4 ${active ? 'text-jumbo-blue' : 'text-gray-500'}`}>{icon}</span>
      <span className="text-lg">{label}</span>
    </button>
  );
}
