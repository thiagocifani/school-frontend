'use client';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { theme, getColor, getShadow } from '@/lib/theme';

export function ThemeDemo() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8" style={{ background: 'var(--surface)' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--card-foreground)' }}>
          Sistema de Cores - Tema Claro
        </h1>
        <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
          Demonstração das cores e componentes do novo sistema de tema claro
        </p>
      </div>

      {/* Cores Principais */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Cores Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold shadow-sm"
                style={{ background: getColor('primary') }}
              >
                Primary
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Primary</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('secondary'), color: getColor('secondaryForeground') }}
              >
                Secondary
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Secondary</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold shadow-sm"
                style={{ background: getColor('accent') }}
              >
                Accent
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Accent</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('muted') }}
              >
                Muted
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Muted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cores de Estado */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Cores de Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold shadow-sm"
                style={{ background: getColor('success') }}
              >
                Success
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Success</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold shadow-sm"
                style={{ background: getColor('warning') }}
              >
                Warning
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Warning</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold shadow-sm"
                style={{ background: getColor('error') }}
              >
                Error
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Error</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('border'), color: getColor('mutedForeground') }}
              >
                Border
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Border</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Novas Cores do Tema Claro */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Novas Cores do Tema Claro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('surface'), color: getColor('surfaceForeground') }}
              >
                Surface
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Surface</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('highlight'), color: getColor('highlightForeground') }}
              >
                Highlight
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Highlight</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('background'), color: getColor('foreground') }}
              >
                Background
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Background</p>
            </div>
            <div className="text-center">
              <div 
                className="w-20 h-20 rounded-lg mx-auto mb-2 flex items-center justify-center font-bold shadow-sm"
                style={{ background: getColor('card'), color: getColor('cardForeground') }}
              >
                Card
              </div>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Card</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Botões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Variantes</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Tamanhos</h4>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Estados</h4>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" loading>Loading</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Variantes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Default
                  </label>
                  <Input placeholder="Digite aqui..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Success
                  </label>
                  <Input variant="success" placeholder="Sucesso!" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Warning
                  </label>
                  <Input variant="warning" placeholder="Atenção!" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Error
                  </label>
                  <Input variant="error" placeholder="Erro!" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Tamanhos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input size="sm" placeholder="Small" />
                <Input size="md" placeholder="Medium" />
                <Input size="lg" placeholder="Large" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sombras */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Sombras e Efeitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 rounded-lg" style={{ 
              background: 'var(--card)',
              boxShadow: getShadow('soft')
            }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Sombra Suave</h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>shadow-soft</p>
            </div>
            <div className="text-center p-6 rounded-lg" style={{ 
              background: 'var(--card)',
              boxShadow: getShadow('medium')
            }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Sombra Média</h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>shadow-medium</p>
            </div>
            <div className="text-center p-6 rounded-lg" style={{ 
              background: 'var(--card)',
              boxShadow: getShadow('large')
            }}>
              <h4 className="font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Sombra Grande</h4>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>shadow-large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Tema */}
      <Card>
        <CardHeader style={{ 
          borderBottom: '1px solid var(--border)',
          background: 'var(--highlight)'
        }}>
          <CardTitle>Informações do Tema Claro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            <p>• Sistema de cores claro e moderno</p>
            <p>• Sombras suaves para profundidade visual</p>
            <p>• Transições suaves para melhor experiência</p>
            <p>• Cores consistentes em todos os componentes</p>
            <p>• Design responsivo e acessível</p>
            <p>• Fácil personalização através de variáveis CSS</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
