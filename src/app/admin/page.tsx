"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PackageSearch, TrendingUp, Tags, Settings, LogOut, ScanLine, BarChart3, ShoppingBag, Menu, X } from 'lucide-react';
import InventoryList from '@/components/InventoryList';
import EmployeePOS from '@/components/EmployeePOS';
import LoginPage from '@/components/LoginPage';
import SettingsPanel from '@/components/SettingsPanel';
import OrdersPanel from '@/components/OrdersPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NavItem, MobileNavItem, MobileDrawerItem } from '@/components/admin/NavItems';
import StatCard from '@/components/admin/StatCard';
import SalesHistory from '@/components/admin/SalesHistory';
import CategoriesView from '@/components/admin/CategoriesView';
import LogoutModal from '@/components/admin/LogoutModal';

const Scanner = dynamic(() => import('@/components/Scanner'), { ssr: false });
const AnalyticsDashboard = dynamic(() => import('@/components/AnalyticsDashboard'), { ssr: false });
import { useAuth } from '@/components/AuthProvider';
import { getProducts, getDashboardStats, getSales } from '@/lib/store';
import { Product, DashboardStats, SaleRecord } from '@/lib/types';

export default function DashboardLayout() {
  const { user, role: authRole, displayName, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    refresh();
  }, [refresh]);

  const handleLogout = () => { setShowLogoutConfirm(false); signOut(); };

  // Loading state
  if (authLoading) {
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

        {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />}

        {/* Mobile Header */}
        <div className="md:hidden bg-jumbo-blue text-white p-4 flex justify-between items-center shadow-md z-10">
          <h1 className="text-xl font-bold tracking-tight">ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span></h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-200">{displayName}</span>
            <button onClick={() => setShowLogoutConfirm(true)} className="p-2 bg-white/10 rounded-lg" aria-label="Одјави се">
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
              onClick={() => setShowLogoutConfirm(true)}
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
            <ErrorBoundary fallbackMessage="Грешка при скенирање.">
              <Scanner onProductSaved={() => { refresh(); }} />
            </ErrorBoundary>
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

      {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />}

      {/* Mobile Header */}
      <div className="md:hidden bg-jumbo-blue text-white p-4 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold tracking-tight">ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span></h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-200">{displayName}</span>
        </div>
      </div>

      {/* Slide-up "More" Menu for Mobile Admin */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setShowMobileMenu(false)} />
          <div className="relative bg-white rounded-t-3xl shadow-2xl w-full max-h-[85vh] overflow-y-auto transform transition-transform animate-in slide-in-from-bottom pb-8">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Мени</h3>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-3 space-y-1">
              <MobileDrawerItem icon={<ShoppingBag />} label="Нарачки" active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setShowMobileMenu(false); }} />
              <MobileDrawerItem icon={<BarChart3 />} label="Аналитика" active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); setShowMobileMenu(false); }} />
              <MobileDrawerItem icon={<Tags />} label="Категории" active={activeTab === 'categories'} onClick={() => { setActiveTab('categories'); setShowMobileMenu(false); }} />
              <MobileDrawerItem icon={<Settings />} label="Поставки" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setShowMobileMenu(false); }} />
              <div className="my-2 border-t border-gray-100" />
              <button
                onClick={() => { setShowMobileMenu(false); setShowLogoutConfirm(true); }}
                className="flex items-center w-full p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="mr-4" size={24} />
                <span className="font-semibold text-lg">Одјави се</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
          <NavItem icon={<BarChart3 />} label="Аналитика" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavItem icon={<Settings />} label="Поставки" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <button
            onClick={() => setShowLogoutConfirm(true)}
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
          <ErrorBoundary fallbackMessage="Грешка при скенирање.">
            <Scanner onProductSaved={() => { refresh(); }} />
          </ErrorBoundary>
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

        {activeTab === 'analytics' && (
          <>
            <header className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Аналитика</h2>
              <p className="text-gray-500 text-sm mt-1">Детални аналитички извештаи за вашиот бизнис.</p>
            </header>
            <ErrorBoundary fallbackMessage="Грешка при аналитика.">
              <AnalyticsDashboard />
            </ErrorBoundary>
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-10 pb-safe">
        <MobileNavItem icon={<PackageSearch size={22} />} label="Залиха" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
        <MobileNavItem icon={<ScanLine size={22} />} label="Скенирај" active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
        <MobileNavItem icon={<TrendingUp size={22} />} label="POS" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
        <MobileNavItem icon={<Menu size={22} />} label="Повеќе" active={['orders', 'analytics', 'categories', 'settings'].includes(activeTab)} onClick={() => setShowMobileMenu(true)} />
      </div>
    </div>
  );
}
