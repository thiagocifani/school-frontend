'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { QrCode, Copy, Eye, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PixVoucherProps {
  invoice: {
    id: number;
    invoice_id: string;
    amount: number;
    formatted_amount: string;
    customer_name: string;
    due_date: string;
    status: string;
    pix_qr_code?: string;
    pix_qr_code_url?: string;
  };
  onGenerateVoucher?: () => void;
  loading?: boolean;
}

export function PixVoucher({ invoice, onGenerateVoucher, loading = false }: PixVoucherProps) {
  const copyPixCode = async () => {
    if (invoice.pix_qr_code) {
      try {
        await navigator.clipboard.writeText(invoice.pix_qr_code);
        toast.success('Código PIX copiado para a área de transferência');
      } catch (error) {
        toast.error('Erro ao copiar código PIX');
      }
    }
  };

  const openPixQrCode = () => {
    if (invoice.pix_qr_code_url) {
      window.open(invoice.pix_qr_code_url, '_blank');
    }
  };

  const downloadPixVoucher = () => {
    // Generate a simple text file with PIX info
    const voucherText = `
COMPROVANTE PIX - SALÁRIO
========================

Beneficiário: ${invoice.customer_name}
Valor: ${invoice.formatted_amount}
Data de Vencimento: ${new Date(invoice.due_date).toLocaleDateString('pt-BR')}
Código PIX: ${invoice.pix_qr_code || 'Não gerado'}
Status: ${invoice.status}

Escola Sistema - ${new Date().toLocaleDateString('pt-BR')}
    `.trim();

    const blob = new Blob([voucherText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pix-voucher-${invoice.invoice_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = () => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'DRAFT': { label: 'Rascunho', variant: 'outline' },
      'OPEN': { label: 'Aberto', variant: 'default' },
      'PAID': { label: 'Pago', variant: 'secondary' },
      'CANCELLED': { label: 'Cancelado', variant: 'destructive' }
    };

    const status = statusMap[invoice.status] || { label: invoice.status, variant: 'outline' };
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const hasPixVoucher = invoice.pix_qr_code || invoice.pix_qr_code_url;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5 text-blue-600" />
            Comprovante PIX
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Invoice Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Beneficiário:</span>
            <p className="text-gray-900">{invoice.customer_name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Valor:</span>
            <p className="text-green-600 font-semibold">{invoice.formatted_amount}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Vencimento:</span>
            <p className="text-gray-900">
              {new Date(invoice.due_date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-600">ID da Fatura:</span>
            <p className="text-gray-900 font-mono text-xs">{invoice.invoice_id}</p>
          </div>
        </div>

        {/* PIX Code Section */}
        {hasPixVoucher ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-3">Código PIX</h4>
            
            {invoice.pix_qr_code && (
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border font-mono text-xs break-all text-gray-700">
                  {invoice.pix_qr_code}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPixCode}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar Código
                  </Button>
                  
                  {invoice.pix_qr_code_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openPixQrCode}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Ver QR Code
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadPixVoucher}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h4 className="text-gray-900 font-medium mb-2">Comprovante PIX não gerado</h4>
            <p className="text-gray-600 text-sm mb-4">
              Clique no botão abaixo para gerar o comprovante PIX para este salário.
            </p>
            
            {onGenerateVoucher && (
              <Button 
                onClick={onGenerateVoucher}
                disabled={loading || invoice.status === 'PAID' || invoice.status === 'CANCELLED'}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {loading ? 'Gerando...' : 'Gerar Comprovante PIX'}
              </Button>
            )}
          </div>
        )}

        {/* Instructions */}
        {hasPixVoucher && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <h5 className="font-medium text-blue-900 text-sm">Como usar o PIX:</h5>
            <ol className="text-blue-800 text-xs mt-1 space-y-1">
              <li>1. Abra o aplicativo do seu banco</li>
              <li>2. Escolha a opção PIX</li>
              <li>3. Escaneie o QR Code ou cole o código copiado</li>
              <li>4. Confirme o pagamento</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}