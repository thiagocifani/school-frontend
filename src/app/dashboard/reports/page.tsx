'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  GraduationCap, 
  ClipboardList,
  BookOpen,
  Calendar,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';

const reportTypes = [
  {
    id: 'attendance',
    title: 'Relatórios de Presença',
    description: 'Relatórios de frequência por turma e por aluno',
    icon: ClipboardList,
    color: 'blue',
    href: '/dashboard/reports/attendance'
  },
  {
    id: 'grades',
    title: 'Boletins de Notas',
    description: 'Boletins com notas das matérias por turma e por aluno',
    icon: BookOpen,
    color: 'green',
    href: '/dashboard/reports/grades'
  },
  {
    id: 'students',
    title: 'Relatório de Alunos',
    description: 'Listagem completa de alunos por turma',
    icon: Users,
    color: 'purple',
    href: '/dashboard/reports/students'
  },
  {
    id: 'teachers',
    title: 'Relatório de Professores',
    description: 'Informações de professores e suas turmas',
    icon: GraduationCap,
    color: 'orange',
    href: '/dashboard/reports/teachers'
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
            Relatórios
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }} className="text-lg">
            Gere e visualize relatórios do sistema escolar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Link key={report.id} href={report.href}>
            <Card className="transition-all duration-200 hover:shadow-lg cursor-pointer group" 
                  style={{ 
                    background: 'var(--card)',
                    border: '1px solid var(--border)'
                  }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg bg-${report.color}-100 dark:bg-${report.color}-900/20`}>
                    <report.icon className={`w-6 h-6 text-${report.color}-600 dark:text-${report.color}-400`} />
                  </div>
                  <Eye className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                       style={{ color: 'var(--muted-foreground)' }} />
                </div>
                <CardTitle className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  {report.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ color: 'var(--muted-foreground)' }} className="text-sm">
                  {report.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card style={{ 
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Calendar className="w-5 h-5" />
            Relatórios Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-medium mb-1">Presenças Hoje</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Relatório de presenças do dia atual
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-medium mb-1">Notas do Período</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Notas do período letivo atual
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="font-medium mb-1">Resumo Mensal</div>
              <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Resumo geral do mês atual
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}