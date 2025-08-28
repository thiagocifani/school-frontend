#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar configurações do Heroku
 * Execute: node debug-heroku.js
 */

console.log('🔍 Diagnóstico de Configuração do Heroku\n');

// 1. Verificar variáveis de ambiente
console.log('📋 Variáveis de Ambiente:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL || 'NÃO DEFINIDA');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NÃO DEFINIDA');

// 2. Verificar configurações do Next.js
console.log('\n🔧 Configurações do Next.js:');
console.log('API URL configurada:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1');

// 3. Testar conectividade com a API
async function testApiConnection() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  console.log(`\n🌐 Testando conectividade com: ${apiUrl}`);
  
  try {
    const response = await fetch(`${apiUrl}/auth/validate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ API está respondendo corretamente');
    } else {
      console.log('⚠️ API respondeu com erro');
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com a API:', error.message);
  }
}

// 4. Verificar configurações de build
console.log('\n🏗️ Informações de Build:');
console.log('Timestamp do build:', new Date().toISOString());
console.log('Plataforma:', process.platform);
console.log('Versão do Node:', process.version);

// 5. Comandos sugeridos
console.log('\n📝 Comandos Sugeridos para Correção:');
console.log('1. Listar apps do Heroku:');
console.log('   heroku apps');
console.log('\n2. Verificar config atual:');
console.log('   heroku config -a SEU_APP_FRONTEND');
console.log('\n3. Definir API URL correta:');
console.log('   heroku config:set NEXT_PUBLIC_API_URL="https://SEU_APP_BACKEND.herokuapp.com/api/v1" -a SEU_APP_FRONTEND');
console.log('\n4. Rebuild da aplicação:');
console.log('   heroku builds:create -a SEU_APP_FRONTEND');

// Executar teste de conectividade se estivermos em ambiente que suporte fetch
if (typeof fetch !== 'undefined') {
  testApiConnection().catch(console.error);
} else {
  console.log('\n⚠️ Fetch não disponível neste ambiente. Execute no browser para testar conectividade.');
}

console.log('\n✨ Diagnóstico concluído!');