'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/redefinir-senha`,
      });

      if (resetError) {
        throw new Error(resetError.message);
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar o link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <button
        onClick={() => router.push('/')}
        className="md:hidden fixed top-4 right-4 z-50 bg-black/80 text-white rounded-full w-9 h-9 flex items-center justify-center border border-neutral-700"
        aria-label="Fechar e voltar para home"
      >
        ✕
      </button>
      <div className="min-h-[calc(100vh-64px)] bg-neutral-950">
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="relative w-24 h-24 md:w-28 md:h-28 mx-auto mb-4 rounded-2xl overflow-hidden bg-black border-2 border-orange-400 shadow-xl">
                <Image
                  src="/logoswest/transparente.png"
                  alt="Escudo Sport Club Westham"
                  fill
                  className="object-contain"
                  sizes="112px"
                  priority
                />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-orange-400 mb-1">
                Esqueci minha senha
              </h1>
              <p className="text-neutral-300 text-sm md:text-base">
                Informe seu email para receber o link de redefinição
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl bg-opacity-95">
              {success ? (
                <>
                  <div className="mb-6 p-4 bg-emerald-100 border-l-4 border-emerald-600 text-emerald-800 rounded">
                    Link enviado! Verifique seu email e clique no link para redefinir sua senha.
                  </div>
                  <Link href="/login">
                    <Button size="lg" className="w-full" variant="secondary">
                      Voltar para o login
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {error && (
                    <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                      type="email"
                      label="Email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <Button
                      type="submit"
                      size="lg"
                      isLoading={isLoading}
                      className="w-full"
                    >
                      Enviar link de redefinição
                    </Button>
                  </form>
                </>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-sm text-orange-600 hover:text-orange-500 font-medium"
                >
                  ← Voltar para o login
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center text-gray-600 text-sm">
              <p>© 2026 Sport Club Westham. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
