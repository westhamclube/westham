'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // O Supabase recupera a sessão automaticamente a partir do hash na URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      setReady(true);
      if (!session) {
        setError('Link inválido ou expirado. Solicite uma nova redefinição de senha.');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== passwordConfirm) {
      setError('As senhas não conferem');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir a senha');
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-64px)] bg-neutral-950 flex items-center justify-center">
          <p className="text-neutral-400">Carregando...</p>
        </div>
      </>
    );
  }

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
                Nova senha
              </h1>
              <p className="text-neutral-300 text-sm md:text-base">
                Digite sua nova senha e confirme
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl bg-opacity-95">
              {error && !success ? (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded">
                  {error}
                </div>
              ) : null}

              {success ? (
                <>
                  <div className="mb-6 p-4 bg-emerald-100 border-l-4 border-emerald-600 text-emerald-800 rounded">
                    Senha alterada com sucesso! Faça login com sua nova senha.
                  </div>
                  <Link href="/login">
                    <Button size="lg" className="w-full">
                      Ir para o login
                    </Button>
                  </Link>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    type="password"
                    label="Nova senha"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />

                  <Input
                    type="password"
                    label="Confirmar nova senha"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={6}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Redefinir senha
                  </Button>
                </form>
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
