'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Header } from '@/components/Header';
import { supabase } from '@/lib/supabase';
import { whatsAppOrderUrl, buildInteresseSocioMessage } from '@/lib/site-config';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    cpf: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    data_nascimento: '',
    password: '',
    passwordConfirm: '',
    interesse_socio: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: checked !== undefined ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.nome || !formData.sobrenome || !formData.email || !formData.cpf || !formData.telefone) {
      setError('Todos os campos são obrigatórios');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('Senhas não conferem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signup({
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email,
        cpf: formData.cpf,
        telefone: formData.telefone,
        cep: formData.cep || undefined,
        logradouro: formData.logradouro || undefined,
        numero: formData.numero || undefined,
        bairro: formData.bairro || undefined,
        data_nascimento: formData.data_nascimento || undefined,
        interesse_socio: formData.interesse_socio,
        password: formData.password,
      });

      if (formData.interesse_socio) {
        const mensagem = `FORMULÁRIO: Interesse em ser sócio

Nome: ${formData.nome} ${formData.sobrenome}
E-mail: ${formData.email}
Telefone: ${formData.telefone}
CPF: ${formData.cpf}
Data de nascimento: ${formData.data_nascimento || '—'}
CEP: ${formData.cep || '—'}
Endereço: ${[formData.logradouro, formData.numero, formData.bairro].filter(Boolean).join(', ') || '—'}`;

        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from('support_messages').insert({
          nome: `${formData.nome} ${formData.sobrenome}`,
          email: formData.email,
          telefone: formData.telefone,
          mensagem,
          tipo: 'interesse_socio',
          user_id: session?.user?.id || null,
        });
        const url = whatsAppOrderUrl(buildInteresseSocioMessage(
          `${formData.nome} ${formData.sobrenome}`,
          formData.email,
          formData.telefone,
        ));
        window.open(url, '_blank');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar');
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
    <div className="min-h-[calc(100vh-64px)] bg-neutral-950 py-12">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative z-10 max-w-md w-full mx-auto px-4">
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
            Torne-se Sócio do Westham
          </h1>
          <p className="text-neutral-300 text-sm md:text-base">
            Cadastre-se para acessar sua área do sócio, descontos e novidades.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-xl bg-opacity-95">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Criar Conta
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="nome"
                label="Nome"
                placeholder="Seu nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
              <Input
                name="sobrenome"
                label="Sobrenome"
                placeholder="Seu sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="cpf"
                label="CPF"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleChange}
                required
              />
              <Input
                name="data_nascimento"
                label="Data de nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              name="telefone"
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={handleChange}
              required
            />

            <Input
              name="cep"
              label="CEP"
              placeholder="00000-000"
              value={formData.cep}
              onChange={handleChange}
              required
            />
            <Input
              name="logradouro"
              label="Logradouro"
              placeholder="Rua, avenida..."
              value={formData.logradouro}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="numero"
                label="Número"
                placeholder="Nº"
                value={formData.numero}
                onChange={handleChange}
                required
              />
              <Input
                name="bairro"
                label="Bairro"
                placeholder="Bairro"
                value={formData.bairro}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="interesse_socio"
                name="interesse_socio"
                checked={formData.interesse_socio}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="interesse_socio" className="text-sm font-semibold text-gray-800">
                TENHO INTERESSE EM SER SÓCIO
              </label>
            </div>

            <Input
              type="password"
              name="password"
              label="Senha"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="passwordConfirm"
              label="Confirmar Senha"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Cadastrar
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-red-600 font-semibold hover:text-orange-600 transition"
              >
                Faça login
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
    </>
  );
}
