#!/bin/bash

# Script para configurar variáveis de ambiente no Heroku
# Execute este script após substituir YOUR_FRONTEND_APP e YOUR_API_APP pelos nomes corretos

# Configuração das variáveis de ambiente
FRONTEND_APP_NAME="YOUR_FRONTEND_APP"  # Substitua pelo nome do app frontend no Heroku
API_APP_NAME="YOUR_API_APP"            # Substitua pelo nome do app backend no Heroku

echo "🔧 Configurando variáveis de ambiente no Heroku..."

# Configurar a URL da API no app frontend
heroku config:set NEXT_PUBLIC_API_URL="https://${API_APP_NAME}.herokuapp.com/api/v1" -a $FRONTEND_APP_NAME

echo "✅ Configuração concluída!"
echo ""
echo "📋 Variáveis configuradas:"
heroku config -a $FRONTEND_APP_NAME | grep NEXT_PUBLIC_API_URL

echo ""
echo "🚀 Para aplicar as mudanças, faça o deploy novamente:"
echo "git push heroku main"