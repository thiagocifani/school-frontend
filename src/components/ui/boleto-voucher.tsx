'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Receipt, ExternalLink, Download, Calendar, User, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BoletoVoucherProps {
  invoice: {
    id: number;
    invoice_id: string;
    amount: number;
    formatted_amount: string;
    customer_name: string;
    due_date: string;
    status: string;
    boleto_url?: string;
    reference?: {
      type: string;
      name: string;
      class_name?: string;
    };
  };
  onGenerateBoleto?: () => void;
  loading?: boolean;
  studentName?: string;
}

export function BoletoVoucher({ invoice, onGenerateBoleto, loading = false, studentName }: BoletoVoucherProps) {
  const openBoleto = () => {
    if (invoice.boleto_url) {
      window.open(invoice.boleto_url, '_blank');
    }
  };

  const downloadBoleto = () => {
    if (invoice.boleto_url) {
      // Create a temporary link to download the boleto
      const a = document.createElement('a');
      a.href = invoice.boleto_url;
      a.download = `boleto-${invoice.invoice_id}.pdf`;
      a.target = '_blank';
      a.click();
    }
  };

  const copyBoletoUrl = async () => {
    if (invoice.boleto_url) {
      try {
        await navigator.clipboard.writeText(invoice.boleto_url);
        toast.success('Link do boleto copiado para a área de transferência');
      } catch (error) {
        toast.error('Erro ao copiar link do boleto');
      }
    }
  };

  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'DRAFT': { label: 'Rascunho', variant: 'outline' },
      'OPEN': { label: 'Aberto', variant: 'default' },
      'PAID': { label: 'Pago', variant: 'secondary' },
      'LATE': { label: 'Em Atraso', variant: 'destructive' },
      'CANCELLED': { label: 'Cancelado', variant: 'destructive' }
    };

    const status = statusMap[invoice.status] || { label: invoice.status, variant: 'outline' };
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const isOverdue = () => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    return today > dueDate && invoice.status !== 'PAID';
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const hasBoleto = invoice.boleto_url;
  const daysUntilDue = getDaysUntilDue();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-orange-600" />
            Boleto Bancário
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-600">Pagador:</span>
              <p className="text-gray-900">{invoice.customer_name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-600">Valor:</span>
              <p className="text-green-600 font-semibold text-lg">{invoice.formatted_amount}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <span className="font-medium text-gray-600">Vencimento:</span>
              <p className={`font-medium ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
              </p>
              {daysUntilDue > 0 && (
                <p className="text-xs text-gray-500">
                  {daysUntilDue} dias para vencer
                </p>
              )}
              {isOverdue() && (
                <p className="text-xs text-red-600">
                  Venceu há {Math.abs(daysUntilDue)} dias
                </p>
              )}
            </div>
          </div>

          {(studentName || invoice.reference) && (
            <div>
              <span className="font-medium text-gray-600">Referente a:</span>
              <p className="text-gray-900">
                {studentName || invoice.reference?.name}
                {invoice.reference?.class_name && (
                  <span className="text-gray-500 text-xs ml-1">
                    ({invoice.reference.class_name})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Due Date Alert */}
        {isOverdue() && (
          <div className="bg-red-50 border-l-4 border-red-400 p-3">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-800 text-sm font-medium">
                Este boleto está vencido há {Math.abs(daysUntilDue)} dias
              </span>
            </div>
          </div>
        )}

        {/* Boleto Section */}
        {hasBoleto ? (
          <div className="border rounded-lg p-4 bg-orange-50">
            <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Boleto Disponível
            </h4>
            
            <div className="space-y-3">
              <p className="text-orange-800 text-sm">
                Seu boleto foi gerado e está pronto para pagamento.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={openBoleto}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visualizar Boleto
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadBoleto}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-gray-900 font-medium mb-2">Boleto não gerado</h4>
            <p className="text-gray-600 text-sm mb-4">
              Clique no botão abaixo para gerar o boleto bancário para esta mensalidade.
            </p>
            
            {onGenerateBoleto && (
              <Button 
                onClick={onGenerateBoleto}
                disabled={loading || invoice.status === 'PAID' || invoice.status === 'CANCELLED'}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <Receipt className="h-4 w-4" />
                {loading ? 'Gerando...' : 'Gerar Boleto'}
              </Button>
            )}
          </div>
        )}

        {/* Payment Instructions */}
        {hasBoleto && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <h5 className="font-medium text-blue-900 text-sm mb-2">Instruções de Pagamento:</h5>
            <ul className="text-blue-800 text-xs space-y-1">
              <li>• Pague em qualquer banco, agência bancária ou internet banking</li>
              <li>• Também aceito em casas lotéricas e correspondentes bancários</li>
              <li>• Após o pagamento, a baixa ocorre em até 3 dias úteis</li>
              <li>• Em caso de dúvidas, entre em contato com a secretaria</li>
            </ul>
          </div>
        )}

        {/* Invoice ID */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <span className="font-mono">ID: {invoice.invoice_id}</span>
        </div>
      </CardContent>
    </Card>
  );
}