#!/bin/bash
# ✅ Checklist de Verificação - Sport Club Westham

echo "🏆 Sport Club Westham - Checklist Final"
echo "========================================"
echo ""

# Verificar estrutura de diretórios
echo "📁 Verificando estrutura..."
[ -d "src/app" ] && echo "✅ src/app existe" || echo "❌ src/app falta"
[ -d "src/components" ] && echo "✅ src/components existe" || echo "❌ src/components falta"
[ -d "src/context" ] && echo "✅ src/context existe" || echo "❌ src/context falta"
[ -d "src/types" ] && echo "✅ src/types existe" || echo "❌ src/types falta"
[ -d "src/lib" ] && echo "✅ src/lib existe" || echo "❌ src/lib falta"

echo ""
echo "📄 Verificando arquivos de páginas..."
[ -f "src/app/page.tsx" ] && echo "✅ Home page existe" || echo "❌ Home page falta"
[ -f "src/app/login/page.tsx" ] && echo "✅ Login page existe" || echo "❌ Login page falta"
[ -f "src/app/signup/page.tsx" ] && echo "✅ Signup page existe" || echo "❌ Signup page falta"
[ -f "src/app/dashboard/page.tsx" ] && echo "✅ Dashboard page existe" || echo "❌ Dashboard page falta"
[ -f "src/app/admin/page.tsx" ] && echo "✅ Admin page existe" || echo "❌ Admin page falta"

echo ""
echo "🧩 Verificando componentes..."
[ -f "src/components/Button.tsx" ] && echo "✅ Button componente existe" || echo "❌ Button falta"
[ -f "src/components/Input.tsx" ] && echo "✅ Input componente existe" || echo "❌ Input falta"
[ -f "src/components/Card.tsx" ] && echo "✅ Card componente existe" || echo "❌ Card falta"
[ -f "src/components/Header.tsx" ] && echo "✅ Header componente existe" || echo "❌ Header falta"

echo ""
echo "🔐 Verificando autenticação..."
[ -f "src/context/AuthContext.tsx" ] && echo "✅ AuthContext existe" || echo "❌ AuthContext falta"
[ -f "src/types/index.ts" ] && echo "✅ Types definidos" || echo "❌ Types faltam"
[ -f "src/lib/supabase.ts" ] && echo "✅ Supabase config existe" || echo "❌ Supabase config falta"

echo ""
echo "📚 Verificando documentação..."
[ -f "README.md" ] && echo "✅ README.md existe" || echo "❌ README.md falta"
[ -f "GUIA_INICIO.md" ] && echo "✅ GUIA_INICIO.md existe" || echo "❌ GUIA_INICIO.md falta"
[ -f "RESUMO_PROJETO.md" ] && echo "✅ RESUMO_PROJETO.md existe" || echo "❌ RESUMO_PROJETO.md falta"
[ -f "SUPABASE_VERCEL_GUIDE.md" ] && echo "✅ SUPABASE_VERCEL_GUIDE.md existe" || echo "❌ SUPABASE_VERCEL_GUIDE.md falta"
[ -f "DATABASE_SCHEMA.sql" ] && echo "✅ DATABASE_SCHEMA.sql existe" || echo "❌ DATABASE_SCHEMA.sql falta"

echo ""
echo "⚙️ Verificando configuração..."
[ -f ".env.local" ] && echo "✅ .env.local existe" || echo "❌ .env.local falta"
[ -f "package.json" ] && echo "✅ package.json existe" || echo "❌ package.json falta"
[ -f "tsconfig.json" ] && echo "✅ tsconfig.json existe" || echo "❌ tsconfig.json falta"
[ -f "next.config.ts" ] && echo "✅ next.config.ts existe" || echo "❌ next.config.ts falta"

echo ""
echo "📦 Verificando dependências..."
npm list react > /dev/null 2>&1 && echo "✅ React instalado" || echo "❌ React não instalado"
npm list next > /dev/null 2>&1 && echo "✅ Next.js instalado" || echo "❌ Next.js não instalado"
npm list tailwindcss > /dev/null 2>&1 && echo "✅ Tailwind instalado" || echo "❌ Tailwind não instalado"
npm list typescript > /dev/null 2>&1 && echo "✅ TypeScript instalado" || echo "❌ TypeScript não instalado"

echo ""
echo "🚀 Verificando servidor..."
if lsof -i :3000 > /dev/null 2>&1; then
  echo "✅ Servidor rodando na porta 3000"
else
  echo "⚠️  Servidor não está rodando (use: npm run dev)"
fi

echo ""
echo "========================================"
echo "✅ Verificação Concluída!"
echo ""
echo "Próximos passos:"
echo "1. Acesse: http://localhost:3000"
echo "2. Login com: admin@westham.com / admin123"
echo "3. Explore as páginas"
echo "4. Leia SUPABASE_VERCEL_GUIDE.md para produção"
