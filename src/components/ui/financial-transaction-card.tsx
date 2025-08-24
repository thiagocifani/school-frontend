'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { PixVoucher } from './pix-voucher';
import { BoletoVoucher } from './boleto-voucher';
import { 
  DollarSign, 
  Calendar, 
  User, 
  GraduationCap, 
  Users, 
  ChevronDown, 
  ChevronUp,
  ArrowUpDown
} from 'lucide-react';
import { coraInvoiceApi } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface FinancialTransactionCardProps {
  transaction: {
    id: number;
    transaction_type: string;
    description: string;
    amount: number;
    formatted_amount: string;
    due_date: string;
    status: string;
    reference?: {
      type: string;
      name: string;
      class_name?: string;
    };
    cora_invoice?: {
      id: number;
      invoice_id: string;
      status: string;
      amount: number;
      formatted_amount: string;
      customer_name: string;
      customer_email: string;
      invoice_type: string;
      boleto_url?: string;
      pix_qr_code?: string;
      pix_qr_code_url?: string;
      due_date: string;
    };
  };
  showPaymentOptions?: boolean;
  onUpdate?: () => void;
}

export function FinancialTransactionCard({ 
  transaction, 
  showPaymentOptions = true,
  onUpdate 
}: FinancialTransactionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coraInvoice, setCoraInvoice] = useState(transaction.cora_invoice);

  const getTransactionIcon = () => {
    switch (transaction.transaction_type) {
      case 'tuition':
        return <GraduationCap className="h-5 w-5 text-blue-600" />;
      case 'salary':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'expense':
        return <ArrowUpDown className="h-5 w-5 text-red-600" />;
      case 'income':
        return <DollarSign className="h-5 w-5 text-emerald-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'pending': { label: 'Pendente', variant: 'outline' },
      'paid': { label: 'Pago', variant: 'secondary' },
      'overdue': { label: 'Em Atraso', variant: 'destructive' },
      'cancelled': { label: 'Cancelado', variant: 'destructive' }
    };

    const status = statusMap[transaction.status] || { label: transaction.status, variant: 'outline' };
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const getTransactionTypeLabel = () => {
    const typeMap: Record<string, string> = {
      'tuition': 'Mensalidade',
      'salary': 'Salário',
      'expense': 'Despesa',
      'income': 'Receita'
    };
    return typeMap[transaction.transaction_type] || transaction.transaction_type;
  };

  const handleGeneratePixVoucher = async () => {
    if (!coraInvoice) return;

    setLoading(true);
    try {
      const { data } = await coraInvoiceApi.generatePixVoucher(coraInvoice.id);
      setCoraInvoice(data.invoice);
      toast.success('Comprovante PIX gerado com sucesso!');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao gerar comprovante PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBoleto = async () => {
    if (!coraInvoice) return;

    setLoading(true);
    try {
      const { data } = await coraInvoiceApi.generateBoleto(coraInvoice.id);
      setCoraInvoice(data.invoice);
      toast.success('Boleto gerado com sucesso!');
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao gerar boleto');
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(transaction.due_date);
    const today = new Date();
    return today > dueDate && transaction.status !== 'paid';
  };

  const shouldShowPixVoucher = transaction.transaction_type === 'salary' && coraInvoice;
  const shouldShowBoleto = transaction.transaction_type === 'tuition' && coraInvoice;

  return (
    <Card className={`w-full ${isOverdue() ? 'border-red-300 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {getTransactionIcon()}
            <div>
              <span>{getTransactionTypeLabel()}</span>
              {transaction.reference && (
                <p className="text-sm font-normal text-gray-600">
                  {transaction.reference.name}
                  {transaction.reference.class_name && (
                    <span className="text-gray-400 ml-1">({transaction.reference.class_name})</span>
                  )}
                </p>
              )}
            </div>
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Transaction Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-600">Valor:</span>
              <p className="text-green-600 font-semibold">{transaction.formatted_amount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-600">Vencimento:</span>
              <p className={`font-medium ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(transaction.due_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div>
            <span className="font-medium text-gray-600">Descrição:</span>
            <p className="text-gray-900 text-sm">{transaction.description}</p>
          </div>
        </div>

        {/* Cora Invoice Information */}
        {coraInvoice && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Opções de Pagamento</h4>
              {showPaymentOptions && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1"
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {expanded ? 'Ocultar' : 'Mostrar'}
                </Button>
              )}
            </div>

            {(expanded || !showPaymentOptions) && (
              <div className="space-y-4">
                {/* PIX Voucher for Salaries */}
                {shouldShowPixVoucher && (
                  <PixVoucher
                    invoice={coraInvoice}
                    onGenerateVoucher={handleGeneratePixVoucher}
                    loading={loading}
                  />
                )}

                {/* Boleto for Tuitions */}
                {shouldShowBoleto && (
                  <BoletoVoucher
                    invoice={coraInvoice}
                    onGenerateBoleto={handleGenerateBoleto}
                    loading={loading}
                    studentName={transaction.reference?.name}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* No Cora Invoice */}
        {!coraInvoice && showPaymentOptions && (
          <div className="border-t pt-3">
            <div className="bg-gray-50 border rounded-lg p-3 text-center">
              <p className="text-gray-600 text-sm">
                Opções de pagamento não disponíveis para esta transação.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}