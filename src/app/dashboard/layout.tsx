'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  FileText, 
  LogOut,
  BookOpen,
  Clock,
  Layers,
  NotebookPen,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Alunos', href: '/dashboard/students', icon: Users },
  { name: 'Professores', href: '/dashboard/teachers', icon: GraduationCap },
  { name: 'Turmas', href: '/dashboard/classes', icon: Calendar },
  { name: 'Diários Eletrônicos', href: '/dashboard/diaries', icon: NotebookPen },
  { name: 'Etapas', href: '/dashboard/academic-terms', icon: Clock },
  { name: 'Níveis de Ensino', href: '/dashboard/education-levels', icon: Layers },
  { name: 'Séries', href: '/dashboard/grade-levels', icon: GraduationCap },
  { name: 'Disciplinas', href: '/dashboard/subjects', icon: BookOpen },
  { name: 'Financeiro', href: '/dashboard/finances/dashboard', icon: DollarSign },
  { name: 'Fluxo de Caixa', href: '/dashboard/finances/cash-flow', icon: TrendingUp },
  { name: 'Relatórios', href: '/dashboard/reports', icon: FileText },
];

export default function DashboardLayout({
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
  }, [loading, isAuthenticated, router]);

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeSidebar} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ 
        background: 'var(--card)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}>
        <div className="flex h-full flex-col">
          {/* Header with logo and close button */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6" style={{ 
            borderBottom: '1px solid var(--border)',
            background: 'var(--highlight)'
          }}>
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              Sistema Escolar
            </h1>
            <button
              className="lg:hidden p-2 rounded-md transition-colors duration-200"
              onClick={closeSidebar}
              style={{ color: 'var(--muted-foreground)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-6 py-4 overflow-y-auto">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200"
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
                    onClick={closeSidebar} // Close sidebar on mobile when item is clicked
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--primary)';
                      e.currentTarget.style.background = 'var(--highlight)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--muted-foreground)';
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <item.icon className="h-6 w-6 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User menu */}
          <div style={{ 
            borderTop: '1px solid var(--border)', 
            padding: '1rem',
            background: 'var(--muted)'
          }}>
            <div className="flex items-center gap-x-3 mb-3">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm flex-shrink-0" style={{ 
                background: 'var(--primary)',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}>
                <span className="text-sm font-medium" style={{ color: 'var(--primary-foreground)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--card-foreground)' }}>{user?.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200"
              style={{
                color: 'var(--muted-foreground)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--error)';
                e.currentTarget.style.background = 'var(--highlight)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted-foreground)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm lg:hidden" style={{ 
        background: 'var(--card)',
        borderColor: 'var(--border)'
      }}>
        <button
          className="p-2 rounded-md transition-colors duration-200"
          onClick={() => setSidebarOpen(true)}
          style={{ color: 'var(--muted-foreground)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-sm font-semibold leading-6 truncate" style={{ color: 'var(--foreground)' }}>
          Sistema Escolar
        </h1>
        <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
          <span className="text-xs font-medium" style={{ color: 'var(--primary-foreground)' }}>
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