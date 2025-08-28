# 🔧 Correção da URL da API no Heroku

## Problema Identificado
O frontend no Heroku está usando a URL incorreta: `https://raizes-api.herokuapp.com/api/v1/auth/login`

## Solução

### 1. Identificar as URLs corretas
Primeiro, identifique os nomes corretos dos seus apps no Heroku:

```bash
# Listar seus apps
heroku apps

# Verificar a URL atual do backend
heroku info -a SEU_APP_BACKEND

# Verificar as variáveis de ambiente do frontend
heroku config -a SEU_APP_FRONTEND
```

### 2. Configurar a variável de ambiente correta

**Opção A: Via CLI do Heroku**
```bash
# Substitua pelos nomes corretos dos seus apps
heroku config:set NEXT_PUBLIC_API_URL="https://SEU_APP_BACKEND.herokuapp.com/api/v1" -a SEU_APP_FRONTEND
```

**Opção B: Via Dashboard do Heroku**
1. Acesse o [Dashboard do Heroku](https://dashboard.heroku.com/)
2. Clique no seu app do frontend
3. Vá em "Settings" → "Config Vars"
4. Adicione/edite a variável:
   - **KEY**: `NEXT_PUBLIC_API_URL`
   - **VALUE**: `https://SEU_APP_BACKEND.herokuapp.com/api/v1`

### 3. Fazer um novo deploy

**Opção A: Rebuild sem mudanças no código**
```bash
# Na pasta do frontend
heroku builds:create -a SEU_APP_FRONTEND
```

**Opção B: Deploy com uma mudança trivial**
```bash
git commit --allow-empty -m "Fix API URL configuration"
git push heroku main
```

### 4. Verificar a configuração

Após o deploy, verifique se a configuração está correta:

```bash
# Verificar as variáveis de ambiente
heroku config -a SEU_APP_FRONTEND

# Verificar os logs em tempo real
heroku logs --tail -a SEU_APP_FRONTEND
```

## URLs de Exemplo

Se seus apps têm esses nomes:
- Frontend: `escola-frontend`
- Backend: `escola-api`

A configuração seria:
```bash
heroku config:set NEXT_PUBLIC_API_URL="https://escola-api.herokuapp.com/api/v1" -a escola-frontend
```

## Troubleshooting

### Se ainda não funcionar:

1. **Limpar cache do browser**
   - Ctrl+F5 ou Cmd+Shift+R

2. **Verificar se o backend está funcionando**
   ```bash
   curl https://SEU_APP_BACKEND.herokuapp.com/api/v1/auth/validate
   ```

3. **Verificar logs do frontend**
   ```bash
   heroku logs --tail -a SEU_APP_FRONTEND
   ```

4. **Verificar logs do backend**
   ```bash
   heroku logs --tail -a SEU_APP_BACKEND
   ```

## Prevenção Futura

Para evitar esse problema no futuro:

1. **Sempre use variáveis de ambiente** para URLs
2. **Documente as configurações** necessárias
3. **Use o arquivo `app.json`** para configurações automáticas
4. **Configure staging e production** separadamente

## Arquivo app.json Atualizado

O arquivo `app.json` já foi atualizado. Edite a linha 15 com a URL correta:

```json
"NEXT_PUBLIC_API_URL": {
  "description": "API URL for the backend service",
  "value": "https://SEU_APP_BACKEND.herokuapp.com/api/v1"
}
```