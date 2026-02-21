'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import type { Product, ProductVariation } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { whatsAppOrderUrl, buildSingleProductMessage, buildCartMessage } from '@/lib/site-config';

type CartItem = Product & { quantidade: number; variacoesSelecionadas?: Record<string, string> };

export default function DashboardLojaPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, Record<string, string>>>({});
  const [verMaisProduct, setVerMaisProduct] = useState<Product | null>(null);

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
            variacoes: (p.variacoes && Array.isArray(p.variacoes)) ? p.variacoes : [],
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

  const getFinalPrice = (product: Product) => {
    const hasSocioDiscount =
      (user?.role === 'sócio' || user?.role === 'jogador') && product.tem_desconto_socio && product.desconto_socio;
    return hasSocioDiscount && product.desconto_socio
      ? product.preco * (1 - product.desconto_socio / 100)
      : product.preco;
  };

  const handleComprar = (product: Product, variacoes?: Record<string, string>) => {
    const finalPrice = getFinalPrice(product);
    const msg = buildSingleProductMessage(
      product.nome,
      product.descricao ?? '',
      finalPrice.toFixed(2),
      variacoes ?? selectedVariations[product.id]
    );
    window.open(whatsAppOrderUrl(msg), '_blank');
  };

  const handleAddToCart = (product: Product, variacoes?: Record<string, string>) => {
    const vars = variacoes ?? selectedVariations[product.id];
    const varsKey = JSON.stringify(vars || {});
    const existing = cart.find((i) => i.id === product.id && JSON.stringify(i.variacoesSelecionadas || {}) === varsKey);
    if (existing) {
      setCart(cart.map((i) => (i.id === product.id && JSON.stringify(i.variacoesSelecionadas || {}) === varsKey ? { ...i, quantidade: i.quantidade + 1 } : i)));
    } else {
      setCart([...cart, { ...product, quantidade: 1, variacoesSelecionadas: vars }]);
    }
  };

  const setVariation = (productId: string, tipo: string, valor: string) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), [tipo]: valor },
    }));
  };

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleEnviarPedidoWhatsApp = () => {
    if (cart.length === 0) return;
    const items = cart.map((item) => ({
      nome: item.nome,
      quantidade: item.quantidade,
      precoUnit: getFinalPrice(item),
      precoTotal: getFinalPrice(item) * item.quantidade,
      variacoes: item.variacoesSelecionadas,
    }));
    window.open(whatsAppOrderUrl(buildCartMessage(items)), '_blank');
  };

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
              Loja Westham
            </h1>
            <p className="text-neutral-300 text-sm md:text-base mt-2">
              Camisetas, acessórios e itens oficiais do Sport Club Westham.
              {(user?.role === 'sócio' || user?.role === 'jogador') && ' Você tem direito a descontos especiais na loja.'}
            </p>
          </div>
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm">Carrinho ({cart.length} itens)</span>
              <Button size="sm" variant="secondary" onClick={handleEnviarPedidoWhatsApp}>
                Enviar pedido por WhatsApp
              </Button>
            </div>
          )}
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
              (user?.role === 'sócio' || user?.role === 'jogador') && product.tem_desconto_socio && product.desconto_socio;
            const finalPrice =
              hasSocioDiscount && product.desconto_socio
                ? product.preco * (1 - product.desconto_socio / 100)
                : product.preco;

            return (
              <Card
                key={product.id}
                className="hover:shadow-2xl transition overflow-hidden bg-neutral-900 border border-neutral-800"
              >
                <div className="w-full aspect-square max-h-64 bg-neutral-800 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={product.imagem_url}
                    alt={product.nome}
                    className="w-full h-full object-contain"
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
                <button type="button" onClick={() => setVerMaisProduct(product)} className="text-sm text-orange-400 hover:text-orange-300 font-medium mb-2">
                  Ver mais
                </button>

                {hasSocioDiscount && product.desconto_socio && (
                  <div className="mb-2 bg-emerald-900/40 border border-emerald-500/60 px-3 py-2 rounded text-xs font-semibold text-emerald-200">
                    {product.desconto_socio}% OFF para sócios e jogadores.
                  </div>
                )}

                {(product.variacoes && product.variacoes.length > 0) && (
                  <div className="mb-3 space-y-2">
                    {product.variacoes.map((v: ProductVariation) => (
                      <div key={v.tipo}>
                        <span className="text-xs font-semibold text-neutral-400 block mb-1">{v.tipo}</span>
                        <div className="flex flex-wrap gap-2">
                          {v.opcoes.map((op) => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => setVariation(product.id, v.tipo, op)}
                              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                                (selectedVariations[product.id] || {})[v.tipo] === op
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                              }`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
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

                <div className="flex flex-col gap-2">
                  <Button
                    size="md"
                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                    disabled={product.estoque === 0}
                    onClick={() => handleComprar(product)}
                  >
                    {product.estoque > 0 ? 'Comprar (WhatsApp)' : 'Fora de Estoque'}
                  </Button>
                  <Button
                    size="md"
                    variant="secondary"
                    className="w-full"
                    disabled={product.estoque === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.estoque > 0 ? 'Adicionar ao carrinho' : 'Fora de Estoque'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {verMaisProduct && (
          <>
            <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setVerMaisProduct(null)} aria-hidden />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-600 rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-orange-300">{verMaisProduct.nome}</h3>
                <button type="button" onClick={() => setVerMaisProduct(null)} className="text-neutral-400 hover:text-white p-1">✕</button>
              </div>
              {verMaisProduct.imagem_url && (
                <div className="w-full aspect-square max-h-64 bg-neutral-800 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                  <img src={verMaisProduct.imagem_url} alt={verMaisProduct.nome} className="w-full h-full object-contain" />
                </div>
              )}
              <p className="text-neutral-200 text-sm whitespace-pre-wrap mb-4">{verMaisProduct.descricao}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-orange-400">R$ {(getFinalPrice(verMaisProduct)).toFixed(2)}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded ${verMaisProduct.estoque > 0 ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
                  {verMaisProduct.estoque > 0 ? `Em estoque (${verMaisProduct.estoque})` : 'Indisponível'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" disabled={verMaisProduct.estoque === 0} onClick={() => { handleComprar(verMaisProduct); setVerMaisProduct(null); }}>
                  Comprar (WhatsApp)
                </Button>
                <Button variant="secondary" className="flex-1" disabled={verMaisProduct.estoque === 0} onClick={() => { handleAddToCart(verMaisProduct); setVerMaisProduct(null); }}>
                  Adicionar ao carrinho
                </Button>
              </div>
            </div>
          </>
        )}

        {cart.length > 0 && (
          <Card className="bg-neutral-900 border border-neutral-700 p-6">
            <h2 className="text-xl font-bold text-neutral-100 mb-4">Seu carrinho</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}-${JSON.stringify(item.variacoesSelecionadas || {})}`}
                  className="flex justify-between items-center py-2 border-b border-neutral-700 last:border-0"
                >
                  <div>
                    <p className="font-medium text-neutral-200">{item.nome}</p>
                    {item.variacoesSelecionadas && Object.keys(item.variacoesSelecionadas).length > 0 && (
                      <p className="text-xs text-orange-300 mt-0.5">
                        {Object.entries(item.variacoesSelecionadas).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                      </p>
                    )}
                    <p className="text-sm text-neutral-400">
                      {item.quantidade}x R$ {getFinalPrice(item).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromCart(idx)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
            <p className="text-lg font-bold text-orange-400 mb-4">
              Total: R${' '}
              {cart
                .reduce((acc, i) => acc + getFinalPrice(i) * i.quantidade, 0)
                .toFixed(2)}
            </p>
            <Button className="w-full" onClick={handleEnviarPedidoWhatsApp}>
              Enviar pedido por WhatsApp
            </Button>
          </Card>
        )}
      </div>
    </main>
  );
}
