 'use client';
 
 import { useState } from 'react';
 import Link from 'next/link';
 import Image from 'next/image';
 import { useRouter } from 'next/navigation';
 import { useAuth } from '@/context/AuthContext';
 import { Button } from '@/components/Button';
 import { Input } from '@/components/Input';
 import { Header } from '@/components/Header';
 
 export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Navegação cliente-side mais rápida e sem recarregar a página inteira
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos. Tente novamente.');
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
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
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
              Sport Club Westham
            </h1>
            <p className="text-neutral-300 text-sm md:text-base">Área de acesso ao portal</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl bg-opacity-95">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Bem-vindo de Volta
            </h2>

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

              <Input
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="text-right">
                <Link
                  href="/esqueci-senha"
                  className="text-sm text-orange-600 hover:text-orange-500 font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Não tem uma conta?{' '}
                <Link
                  href="/signup"
                  className="text-red-600 font-semibold hover:text-orange-600 transition"
                >
                  Cadastre-se agora
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-600 text-sm">
            <p>© 2026 Sport Club Westham. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
    </>
  );
}
