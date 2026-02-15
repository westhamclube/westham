/**
 * Configuração centralizada do site - redes sociais e links oficiais.
 * Usado no Footer e no Dashboard automaticamente.
 */
export const SITE_SOCIAL = {
  facebook: 'https://facebook.com/share/1FEcnNWcKn/?mibextid=wwXIfr',
  instagram: 'https://www.instagram.com/clubewestham?igsh=MXN2eHQ5Yndqcmpoaw==',
  youtube: 'https://youtube.com/@westtvguaiba?si=pN9qoLURDF-GXrgh',
  youtubeStreams: 'https://www.youtube.com/@WESTTVGUAIBA/streams',
  tiktok: 'https://tiktok.com/@clubewestham?_t=ZM-90LzxjMPxSV&_r=1',
} as const;

/** URL embed para transmissão ao vivo. Use NEXT_PUBLIC_LIVE_STREAM_URL quando houver vídeo ao vivo. */
export const LIVE_STREAM_EMBED = process.env.NEXT_PUBLIC_LIVE_STREAM_URL || '';

/** Telefone do dono do site para pedidos da loja (WhatsApp). Formato: 5551981889351 */
export const WHATSAPP_OWNER_PHONE = '5551981889351';

export function whatsAppOrderUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_OWNER_PHONE}?text=${encodeURIComponent(message)}`;
}

/** Mensagem para comprar um único produto (nome, descrição, valor). Inclui variações selecionadas se houver. */
export function buildSingleProductMessage(
  nome: string,
  descricao: string,
  valor: string,
  variacoes?: Record<string, string>
): string {
  const varLines = variacoes && Object.keys(variacoes).length > 0
    ? '\n' + Object.entries(variacoes).map(([tipo, op]) => `*${tipo}:* ${op}`).join('\n') + '\n'
    : '';
  return `Olá! Gostaria de comprar o seguinte produto do Westham:

*${nome}*
${descricao}${varLines}
*Valor:* R$ ${valor}

Quero personalizar/confirmar este pedido pelo WhatsApp.`;
}

/** Mensagem com todos os itens do carrinho (lista 1 a 1 e total). */
export function buildCartMessage(
  items: {
    nome: string;
    quantidade: number;
    precoUnit: number;
    precoTotal: number;
    variacoes?: Record<string, string>;
  }[]
): string {
  const lines = items.map((item, i) => {
    const varStr = item.variacoes && Object.keys(item.variacoes).length > 0
      ? ' (' + Object.entries(item.variacoes).map(([k, v]) => `${k}: ${v}`).join(', ') + ')'
      : '';
    return `${i + 1}. ${item.nome}${varStr} - ${item.quantidade}x R$ ${item.precoUnit.toFixed(2)} = R$ ${item.precoTotal.toFixed(2)}`;
  });
  const total = items.reduce((acc, item) => acc + item.precoTotal, 0);
  return `Olá! Gostaria de comprar os seguintes produtos do Westham:

${lines.join('\n')}

*Total: R$ ${total.toFixed(2)}*

Quero personalizar/confirmar meu pedido pelo WhatsApp.`;
}
