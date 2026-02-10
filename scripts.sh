#!/bin/bash
# Scripts úteis para o projeto Westham

echo "🏆 Sport Club Westham - Scripts de Desenvolvimento"
echo "=================================================="
echo ""

# Verificar qual comando foi passado
case "$1" in
  start)
    echo "🚀 Iniciando servidor de desenvolvimento..."
    npm run dev
    ;;
  
  build)
    echo "🔨 Compilando para produção..."
    npm run build
    ;;
  
  test)
    echo "✅ Executando testes..."
    npm test
    ;;
  
  lint)
    echo "🔍 Analisando código..."
    npm run lint
    ;;
  
  clean)
    echo "🧹 Limpando arquivos gerados..."
    rm -rf .next
    rm -rf node_modules
    npm install
    echo "✅ Limpeza concluída!"
    ;;
  
  install)
    echo "📦 Instalando dependências..."
    npm install
    echo "✅ Dependências instaladas!"
    ;;
  
  *)
    echo "Comandos disponíveis:"
    echo ""
    echo "  npm start        - Inicia servidor de desenvolvimento"
    echo "  npm build        - Compila para produção"
    echo "  npm test         - Executa testes"
    echo "  npm lint         - Analisa código"
    echo "  npm clean        - Limpa arquivos gerados"
    echo "  npm install      - Instala dependências"
    echo ""
    ;;
esac
