"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PackageSearch, TrendingUp, Tags, Settings, LogOut, ScanLine, BarChart3, ShoppingBag } from 'lucide-react';
import Scanner from '@/components/Scanner';
import InventoryList from '@/components/InventoryList';
import EmployeePOS from '@/components/EmployeePOS';
import LoginPage from '@/components/LoginPage';
import SettingsPanel from '@/components/SettingsPanel';
import OrdersPanel from '@/components/OrdersPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/components/AuthProvider';
import { getProducts, getDashboardStats, getSales } from '@/lib/store';
import { Product, DashboardStats, SaleRecord } from '@/lib/types';

export default function DashboardLayout() {
  const { user, role: authRole, displayName, loading: authLoading, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalStockValue: 0, todaySalesTotal: 0, todaySalesCount: 0 });
  const [sales, setSales] = useState<SaleRecord[]>([]);

  const refresh = useCallback(async () => {
    const [p, s, st] = await Promise.all([getProducts(), getSales(), getDashboardStats()]);
    setProducts(p);
    setSales(s);
    setStats(st);
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  // Loading state
  if (!mounted || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Се вчитува...</p>
        </div>
      </div>
    );
  }

  // Auth gate — require login
  if (!user || !authRole) {
    return <LoginPage />;
  }

  // Employee role → show Inventory, Scanner, POS, Orders (no settings/categories/stats)
  if (authRole === 'employee') {
    return (
      <div className="flex h-screen bg-gray-50 flex-col md:flex-row">

        {/* Mobile Header */}
        <div className="md:hidden bg-jumbo-blue text-white p-4 flex justify-between items-center shadow-md z-10">
          <h1 className="text-xl font-bold tracking-tight">ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span></h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-200">{displayName}</span>
            <button onClick={signOut} className="p-2 bg-white/10 rounded-lg">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-jumbo-blue text-white shadow-xl shrink-0">
          <div className="p-6 border-b border-white/10">
            <h1 className="text-2xl font-black tracking-tighter">
              ИНТЕР СТАР<br />
              <span className="text-jumbo-red bg-white px-2 py-0.5 rounded shadow-sm inline-block mt-1">ЏАМБО</span>
            </h1>
            <p className="text-indigo-200 text-sm mt-2">{displayName}</p>
            <span className="inline-block bg-white/15 text-xs px-2 py-0.5 rounded-full mt-1 text-indigo-200">Вработен</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavItem icon={<PackageSearch />} label="Залиха (Инвентар)" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
            <NavItem icon={<ScanLine />} label="Нов Артикл" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
            <NavItem icon={<TrendingUp />} label="Продажба (POS)" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
            <NavItem icon={<ShoppingBag />} label="Нарачки" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={signOut}
              className="flex items-center w-full p-3 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="mr-3" size={20} />
              <span className="font-medium">Одјави се</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {activeTab === 'inventory' && (
            <>
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Преглед на залиха</h2>
                <p className="text-gray-500 text-sm mt-1">Проверете ја моменталната состојба на инвентарот.</p>
              </header>
              {products.length > 0 ? (
                <ErrorBoundary fallbackMessage="Грешка при прикажување на инвентарот.">
                  <InventoryList products={products} onRefresh={refresh} />
                </ErrorBoundary>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                  <PackageSearch className="text-gray-300 w-16 h-16 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Нема пронајдено артикли</h3>
                  <p className="text-gray-500 max-w-sm mt-2">Базата е моментално празна. Кликнете на &quot;Нов Артикл&quot; за да додадете.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'scanner' && (
            <>
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Регистрација на нов продукт</h2>
                <p className="text-gray-500 text-sm mt-1">Сликајте за автоматско препознавање со помош на вештачка интелигенција.</p>
              </header>
              <ErrorBoundary fallbackMessage="Грешка при скенирање.">
                <Scanner onProductSaved={() => { refresh(); }} />
              </ErrorBoundary>
            </>
          )}

          {activeTab === 'sales' && (
            <>
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Продажба</h2>
                <p className="text-gray-500 text-sm mt-1">Изберете артикл за продажба.</p>
              </header>
              <EmployeePOS products={products} onSaleComplete={refresh} />
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Нарачки</h2>
                <p className="text-gray-500 text-sm mt-1">Управувајте со испорака на онлајн нарачки.</p>
              </header>
              <ErrorBoundary fallbackMessage="Грешка при нарачки.">
                <OrdersPanel />
              </ErrorBoundary>
            </>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-10">
          <MobileNavItem icon={<PackageSearch size={20} />} label="Залиха" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <MobileNavItem icon={<ScanLine size={20} />} label="Нов" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
          <MobileNavItem icon={<TrendingUp size={20} />} label="POS" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
          <MobileNavItem icon={<ShoppingBag size={20} />} label="Нарачки" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        </div>
      </div>
    );
  }

  // Admin role → full dashboard

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">

      {/* Mobile Header */}
      <div className="md:hidden bg-jumbo-blue text-white p-4 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold tracking-tight">ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span></h1>
        <button
          onClick={() => setActiveTab('scanner')}
          className="p-2 bg-white/10 rounded-lg"
        >
          <ScanLine size={24} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-jumbo-blue text-white shadow-xl shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-black tracking-tighter">
            ИНТЕР СТАР<br />
            <span className="text-jumbo-red bg-white px-2 py-0.5 rounded shadow-sm inline-block mt-1">ЏАМБО</span>
          </h1>
          <p className="text-indigo-200 text-sm mt-2">{displayName}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<PackageSearch />} label="Залиха (Инвентар)" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <NavItem icon={<ScanLine />} label="Нов Артикл" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
          <NavItem icon={<Tags />} label="Категории" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <NavItem icon={<TrendingUp />} label="Продажба" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
          <NavItem icon={<ShoppingBag />} label="Нарачки" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavItem icon={<Settings />} label="Поставки" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <button
            onClick={signOut}
            className="flex items-center w-full p-3 mt-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="mr-3" size={20} />
            <span className="font-medium">Одјави се</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {activeTab === 'inventory' && (
          <>
            <header className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Преглед на залиха</h2>
                <p className="text-gray-500 text-sm mt-1">Управувајте со продуктите и проверете ја моменталната состојба.</p>
              </div>
              <button
                onClick={() => setActiveTab('scanner')}
                className="hidden md:flex items-center bg-jumbo-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
              >
                <ScanLine className="mr-2" size={20} />
                Додај Нов Артикл
              </button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Вкупно Артикли" value={stats.totalProducts.toLocaleString()} change={`${products.length} различни продукти`} />
              <StatCard title="Вредност на Залиха" value={`${stats.totalStockValue.toLocaleString()} ден`} change="Продажна вредност" />
              <StatCard title="Денешна Продажба" value={`${stats.todaySalesTotal.toLocaleString()} ден`} change={`${stats.todaySalesCount} продадени артикли`} highlight />
            </div>

            {products.length > 0 ? (
              <ErrorBoundary fallbackMessage="Грешка при прикажување на инвентарот.">
                <InventoryList products={products} onRefresh={refresh} />
              </ErrorBoundary>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <PackageSearch className="text-gray-300 w-16 h-16 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Нема пронајдено артикли</h3>
                <p className="text-gray-500 max-w-sm mt-2">Базата е моментално празна. Кликнете на копчето за скенирање за да започнете со додавање на инвентар.</p>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="mt-6 bg-jumbo-blue text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                >
                  Додај прв артикл →
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'scanner' && (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Регистрација на нов продукт</h2>
              <p className="text-gray-500 text-sm mt-1">Сликајте за автоматско препознавање со помош на вештачка интелигенција.</p>
            </header>
            <ErrorBoundary fallbackMessage="Грешка при скенирање.">
              <Scanner onProductSaved={() => { refresh(); }} />
            </ErrorBoundary>
          </>
        )}

        {activeTab === 'sales' && (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Историја на продажба</h2>
              <p className="text-gray-500 text-sm mt-1">Преглед на сите продажби.</p>
            </header>
            <SalesHistory sales={sales} />
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Категории</h2>
              <p className="text-gray-500 text-sm mt-1">Прегледај ги категориите и бројот на артикли.</p>
            </header>
            <CategoriesView products={products} />
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Поставки</h2>
              <p className="text-gray-500 text-sm mt-1">Управувајте со корисниците и пристапот.</p>
            </header>
            <ErrorBoundary fallbackMessage="Грешка при поставки.">
              <SettingsPanel />
            </ErrorBoundary>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Нарачки</h2>
              <p className="text-gray-500 text-sm mt-1">Онлајн нарачки од веб продавницата.</p>
            </header>
            <ErrorBoundary fallbackMessage="Грешка при нарачки.">
              <OrdersPanel />
            </ErrorBoundary>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-10">
        <MobileNavItem icon={<PackageSearch size={20} />} label="Залиха" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
        <MobileNavItem icon={<ScanLine size={20} />} label="Скенирај" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
        <MobileNavItem icon={<TrendingUp size={20} />} label="Продажба" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
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

function MobileNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 ${active ? 'text-jumbo-blue font-semibold' : 'text-gray-500 hover:text-gray-900'}`}>
      <div className="mb-1">{icon}</div>
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function StatCard({ title, value, change, highlight = false }: { title: string; value: string; change: string; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl border ${highlight ? 'bg-jumbo-blue-light border-blue-200' : 'bg-white border-gray-100 shadow-sm'}`}>
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <div className={`text-2xl font-bold ${highlight ? 'text-jumbo-blue' : 'text-gray-900'}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-2 font-medium">{change}</div>
    </div>
  );
}

function SalesHistory({ sales }: { sales: SaleRecord[] }) {
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

function CategoriesView({ products }: { products: Product[] }) {
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
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
          <div className="text-sm text-gray-500 mt-1">Вредност: {data.value.toLocaleString()} ден</div>
        </div>
      ))}
    </div>
  );
}
