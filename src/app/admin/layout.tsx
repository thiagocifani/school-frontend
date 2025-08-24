'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import {
  Users,
  GraduationCap,
  UserCheck,
  Settings,
  BarChart3,
  Shield,
  Home,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
  };

  const menuItems = [
    {
      label: 'Dashboard',
      icon: Home,
      href: '/admin',
    },
    {
      label: 'Usuários',
      icon: Users,
      href: '/admin/users',
    },
    {
      label: 'Estudantes',
      icon: GraduationCap,
      href: '/admin/students',
    },
    {
      label: 'Responsáveis',
      icon: UserCheck,
      href: '/admin/guardians',
    },
    {
      label: 'Professores',
      icon: Users,
      href: '/admin/teachers',
    },
    {
      label: 'Turmas',
      icon: Users,
      href: '/admin/classes',
    },
    {
      label: 'Relatórios',
      icon: BarChart3,
      href: '/admin/reports',
    },
    {
      label: 'Sistema',
      icon: Settings,
      href: '/admin/system',
    },
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <Shield className="h-5 w-5" />
              <span>Acesso restrito a administradores</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="text-sm text-slate-300">Logado como:</div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-slate-400">{user.email}</div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full bg-transparent border-slate-600 text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}