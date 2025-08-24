import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600',
    inactive: 'text-gray-600',
    transferred: 'text-blue-600',
    pending: 'text-yellow-600',
    paid: 'text-green-600',
    overdue: 'text-red-600',
    cancelled: 'text-gray-600',
    present: 'text-green-600',
    absent: 'text-red-600',
    late: 'text-yellow-600',
    justified: 'text-blue-600',
  }
  
  return colors[status] || 'text-gray-600'
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    transferred: 'Transferido',
    pending: 'Pendente',
    paid: 'Pago',
    overdue: 'Em Atraso',
    cancelled: 'Cancelado',
    present: 'Presente',
    absent: 'Ausente',
    late: 'Atrasado',
    justified: 'Justificado',
    admin: 'Administrador',
    teacher: 'Professor',
    guardian: 'Responsável',
    financial: 'Financeiro',
  }
  
  return texts[status] || status
}