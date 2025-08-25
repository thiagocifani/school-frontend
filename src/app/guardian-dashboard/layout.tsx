'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home,
  Users,
  FileText,
  LogOut,
  Heart,
  GraduationCap,
  Calendar,
  CreditCard,
  Menu,
  X
} from 'lucide-react';

const guardianNavigation = [
  { name: 'Dashboard', href: '/guardian-dashboard', icon: Home },
  { name: 'Meus Filhos', href: '/guardian-dashboard/children', icon: Users },
  { name: 'Mensalidades', href: '/guardian-dashboard/tuitions', icon: CreditCard },
  { name: 'Calendário Escolar', href: '/guardian-dashboard/calendar', icon: Calendar },
  { name: 'Comunicados', href: '/guardian-dashboard/announcements', icon: FileText },
];

export default function GuardianDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    // Verificar se o usuário é responsável
    if (!loading && isAuthenticated && user?.role !== 'guardian') {
      if (user?.role === 'teacher') {
        router.push('/teacher-dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'guardian') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeSidebar} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo with close button */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-gradient-to-r from-slate-800 to-emerald-800">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-slate-700" />
              </div>
              <h1 className="text-lg font-bold text-white">
                Portal da Família
              </h1>
            </div>
            <button
              className="lg:hidden p-1 rounded-md text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
              onClick={closeSidebar}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-6 py-4 overflow-y-auto">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {guardianNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-medium transition-all duration-200 text-gray-700 hover:text-slate-700 hover:bg-emerald-50"
                    onClick={closeSidebar}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User menu */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center gap-x-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-slate-600 to-emerald-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">Responsável</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-all duration-200 text-gray-700 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm lg:hidden">
        <button
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-6 w-6 bg-gradient-to-r from-slate-600 to-emerald-600 rounded-md flex items-center justify-center">
            <Heart className="h-3 w-3 text-white" />
          </div>
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            Portal da Família
          </h1>
        </div>
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-slate-600 to-emerald-600 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="py-4 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}