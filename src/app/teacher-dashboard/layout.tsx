'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  DollarSign,
  LogOut,
  NotebookPen,
  Users,
  AlertTriangle
} from 'lucide-react';

const teacherNavigation = [
  { name: 'Dashboard', href: '/teacher-dashboard', icon: BookOpen },
  { name: 'Meus Diários', href: '/teacher-dashboard/diaries', icon: NotebookPen },
  { name: 'Ocorrências', href: '/teacher-dashboard/occurrences', icon: AlertTriangle },
  { name: 'Meus Salários', href: '/teacher-dashboard/salaries', icon: DollarSign },
];

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    // Verificar se o usuário é professor
    if (!loading && isAuthenticated && user?.role !== 'teacher') {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-lg" style={{ 
        background: 'var(--card)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6" style={{ 
            borderBottom: '1px solid var(--border)',
            background: 'var(--highlight)'
          }}>
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              Portal do Professor
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-6 py-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {teacherNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200"
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
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
                    {item.name}
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
              <div className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm" style={{ 
                background: 'var(--primary)',
                boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
              }}>
                <span className="text-sm font-medium" style={{ color: 'var(--primary-foreground)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Professor</p>
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
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}