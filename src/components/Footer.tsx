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
                className="hover:text-orange-400 transition flex items-center gap-3"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-neutral-100"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.5 9H15V6.75C15 5.784 14.216 5 13.25 5H11a4 4 0 0 0-4 4v2.5H5.5a.5.5 0 0 0-.5.5V14a.5.5 0 0 0 .5.5H7V19a.5.5 0 0 0 .5.5H10a.5.5 0 0 0 .5-.5v-4.5h2.25a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5H10.5V9a1.5 1.5 0 0 1 1.5-1.5h1.5Z" />
                  </svg>
                </span>
                <span>Facebook</span>
              </a>
            </li>
            <li>
              <a
                href={SITE_SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-3"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-neutral-100"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="4" y="4" width="16" height="16" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span>Instagram</span>
              </a>
            </li>
            <li>
              <a
                href={SITE_SOCIAL.youtube}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-3"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-neutral-100"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.76C18.1 5 12 5 12 5s-6.1 0-7.84.44A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.76C5.9 19 12 19 12 19s6.1 0 7.84-.44a2.5 2.5 0 0 0 1.76-1.76A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8Z" />
                    <path d="M10 15.5 15 12l-5-3.5v7Z" fill="black" />
                  </svg>
                </span>
                <span>YouTube - West TV Guaíba</span>
              </a>
            </li>
            <li>
              <a
                href={SITE_SOCIAL.tiktok}
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-400 transition flex items-center gap-3"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700">
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4 text-neutral-100"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M16.5 4.5c.5.6 1.1 1.1 1.8 1.5.5.3 1 .5 1.7.6v3a6 6 0 0 1-3.1-.9v4.8A5.5 5.5 0 1 1 12 8.5v2.9a2.5 2.5 0 1 0 1.8 2.4V4.5h2.7Z" />
                  </svg>
                </span>
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

