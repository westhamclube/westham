import Link from 'next/link';
import Image from 'next/image';
import { SITE_SOCIAL } from '@/lib/site-config';

export function Footer() {
  return (
    <footer className="bg-black text-white mt-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        {/* Logo e resumo */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/logoswest/ESCUDO PNG.png"
                alt="Escudo Sport Club Westham"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-orange-400 uppercase tracking-[0.25em]">
                Sport Club
              </span>
              <span className="font-extrabold text-lg leading-tight">WESTHAM</span>
            </div>
          </div>
          <p className="text-sm text-neutral-300">
            Tradição, paixão e compromisso com o futebol em Guaíba. Acompanhe jogos, projetos,
            loja oficial e a sociedade de sócios do clube.
          </p>
        </div>

        {/* Navegação institucional */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-orange-400 uppercase tracking-wide">
            Institucional
          </h3>
          <nav className="flex flex-col gap-2 text-sm text-neutral-200">
            <Link href="/termos" className="hover:text-orange-400 transition">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-orange-400 transition">
              Política de Privacidade
            </Link>
            <Link href="/suporte" className="hover:text-orange-400 transition">
              Suporte &amp; Contato
            </Link>
          </nav>
        </div>

        {/* Redes sociais */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-orange-400 uppercase tracking-wide">
            Redes Sociais
          </h3>
          <ul className="space-y-2 text-sm text-neutral-200">
            <li>
              <a
                href={SITE_SOCIAL.facebook}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-2"
              >
                <span className="text-lg">f</span>
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a
                href={SITE_SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-2"
              >
                <span className="text-lg">📷</span>
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a
                href={SITE_SOCIAL.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-2"
              >
                <span className="text-lg">▶</span>
                <span>YouTube - West TV Guaíba</span>
              </a>
            </li>
            <li>
              <a
                href={SITE_SOCIAL.tiktok}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-2"
              >
                <span className="text-lg">♬</span>
                <span>TikTok</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Suporte / App */}
        <div className="space-y-3 text-sm text-neutral-200">
          <h3 className="font-semibold text-sm text-orange-400 uppercase tracking-wide">
            Suporte &amp; App
          </h3>
          <p>
            Suporte oficial:{' '}
            <a
              href="mailto:westhamsuporteclube@gmail.com"
              className="text-orange-400 hover:text-orange-300 break-all"
            >
              westhamsuporteclube@gmail.com
            </a>
          </p>
          <div className="space-y-1">
            <p className="font-semibold text-neutral-100">
              Adicione o site à tela inicial:
            </p>
            <p>
              <span className="font-semibold text-orange-300">Android</span>: abra o site no
              Chrome &rarr; menu ⋮ &rarr; &quot;Adicionar à tela inicial&quot;.
            </p>
            <p>
              <span className="font-semibold text-orange-300">iOS (iPhone)</span>: abra o site
              no Safari &rarr; botão &quot;Compartilhar&quot; &rarr; &quot;Adicionar à Tela
              de Início&quot;.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Sport Club Westham. Todos os direitos reservados.
          </p>
          <p className="text-xs text-neutral-500">
            Site oficial desenvolvido com foco em sócios, atletas e comunidade Westham.
          </p>
        </div>
      </div>
    </footer>
  );
}

