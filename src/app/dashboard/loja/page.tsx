'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLojaPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(
          data.map((p: any) => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            preco: Number(p.preco),
            imagem_url: p.imagem_url,
            imagens: p.imagens ?? [],
            modelos: p.modelos ?? [],
            categoria: p.categoria,
            estoque: p.estoque,
            data_criacao: p.created_at,
            ativo: p.ativo,
            desconto_socio: p.desconto_socio ?? undefined,
            tem_desconto_socio: p.tem_desconto_socio ?? false,
          })),
        );
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <main className="bg-neutral-950 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-orange-400 hover:text-orange-300 mb-2 inline-block"
            >
              ← Voltar ao dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-orange-300">
              Loja Oficial Westham
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Camisetas, acessórios e itens oficiais do Sport Club Westham.
              {user?.role === 'sócio' && ' Você é sócio: veja os produtos com desconto especial.'}
            </p>
          </div>
        </div>

        {loading && <p className="text-neutral-400 text-sm">Carregando produtos...</p>}

        {!loading && products.length === 0 && (
          <Card className="bg-neutral-900 border border-neutral-800 text-neutral-200">
            Nenhum produto cadastrado ainda. O administrador pode adicionar itens da loja pelo
            painel.
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const hasSocioDiscount =
              user?.role === 'sócio' && product.tem_desconto_socio && product.desconto_socio;
            const finalPrice =
              hasSocioDiscount && product.desconto_socio
                ? product.preco * (1 - product.desconto_socio / 100)
                : product.preco;

            return (
              <Card
                key={product.id}
                className="hover:shadow-2xl transition overflow-hidden bg-neutral-900 border border-neutral-800"
              >
                <div className="w-full h-48 bg-neutral-800 flex items-center justify-center mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.imagem_url}
                    alt={product.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://via.placeholder.com/200?text=Sem+Imagem';
                    }}
                  />
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-neutral-50">{product.nome}</h3>
                  <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs font-semibold">
                    {product.categoria}
                  </span>
                </div>

                <p className="text-sm text-neutral-300 mb-3 line-clamp-2">
                  {product.descricao}
                </p>

                {hasSocioDiscount && product.desconto_socio && (
                  <div className="mb-2 bg-emerald-900/40 border border-emerald-500/60 px-3 py-2 rounded text-xs font-semibold text-emerald-200">
                    Sócios têm {product.desconto_socio}% OFF neste produto.
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    {hasSocioDiscount && (
                      <span className="text-sm text-neutral-400 line-through">
                        R$ {product.preco.toFixed(2)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-orange-400">
                      R$ {finalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-semibold px-3 py-1 rounded ${
                      product.estoque > 0
                        ? 'bg-green-900/40 text-green-300'
                        : 'bg-red-900/40 text-red-300'
                    }`}
                  >
                    {product.estoque > 0
                      ? `Em estoque (${product.estoque})`
                      : 'Indisponível'}
                  </div>
                </div>

                <Button
                  size="md"
                  className="w-full"
                  disabled={product.estoque === 0}
                >
                  {product.estoque > 0 ? 'Adicionar ao Carrinho (em breve)' : 'Fora de Estoque'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
