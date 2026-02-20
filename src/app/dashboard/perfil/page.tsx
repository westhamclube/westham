'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/storage';

export default function PerfilPage() {
  const { user, refreshUser } = useAuth();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNew, setPasswordNew] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [playerStats, setPlayerStats] = useState<any | null>(null);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setSobrenome(user.sobrenome || '');
      setTelefone(user.telefone || '');
      setCep(user.cep || '');
      setLogradouro(user.logradouro || '');
      setNumero(user.numero || '');
      setBairro(user.bairro || '');
      setDataNascimento(user.data_nascimento ? user.data_nascimento.slice(0, 10) : '');
      setAvatarUrl(user.avatar_url || '');
      setInstagramUrl((user as any).instagram_url || '');
      setFacebookUrl((user as any).facebook_url || '');
      setTiktokUrl((user as any).tiktok_url || '');
    }
  }, [user]);

  // Carregar estatísticas do jogador (se a conta for de jogador)
  useEffect(() => {
    if (!user || user.role !== 'jogador') return;

    const load = async () => {
      setLoadingPlayerStats(true);
      try {
        const { data, error } = await supabase
          .from('players')
          .select('id, nome, numero, posicao, idade, gols, assists, nivel')
          .eq('nome', user.nome)
          .maybeSingle();

        if (!error && data) {
          setPlayerStats(data);
        } else {
          setPlayerStats(null);
        }
      } finally {
        setLoadingPlayerStats(false);
      }
    };

    load();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'err', text: 'Selecione uma imagem (JPG, PNG, WebP ou GIF).' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'A imagem deve ter no máximo 2 MB.' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMsg(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg(null);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(user.id, avatarFile, user.avatar_url);
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: nome.trim(),
          last_name: sobrenome.trim(),
          full_name: `${nome.trim()} ${sobrenome.trim()}`,
          telefone: telefone.trim(),
          avatar_url: finalAvatarUrl || null,
          instagram_url: instagramUrl.trim() || null,
          facebook_url: facebookUrl.trim() || null,
          tiktok_url: tiktokUrl.trim() || null,
          cep: cep.trim() || null,
          logradouro: logradouro.trim() || null,
          numero: numero.trim() || null,
          bairro: bairro.trim() || null,
          data_nascimento: dataNascimento.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      await refreshUser();
      setAvatarUrl(finalAvatarUrl || '');
      setMsg({ type: 'ok', text: 'Perfil atualizado com sucesso.' });
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message || 'Erro ao salvar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordCurrent || !passwordNew || passwordNew.length < 6) {
      setMsg({ type: 'err', text: 'Preencha a senha atual e uma nova senha (mín. 6 caracteres).' });
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setMsg({ type: 'err', text: 'A nova senha e a confirmação não conferem.' });
      return;
    }
    setPasswordSaving(true);
    setMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordNew,
      });
      if (error) throw error;
      setPasswordCurrent('');
      setPasswordNew('');
      setPasswordConfirm('');
      setMsg({ type: 'ok', text: 'Senha alterada com sucesso.' });
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message || 'Erro ao alterar senha.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <main className="bg-neutral-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-orange-600 hover:text-orange-500 mb-2 inline-block"
          >
            ← Voltar ao portal
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Meu perfil</h1>
          <p className="text-neutral-600 mt-1">Edite seus dados e gerencie sua conta.</p>
        </div>

        {msg && (
          <div
            className={`p-4 rounded-lg ${
              msg.type === 'ok' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Selo do membro */}
        <Card className="p-4 border border-neutral-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Tipo de conta
              </p>
              <p className="font-bold text-neutral-900">
                {user.role === 'sócio'
                  ? 'Sócio do clube'
                  : user.role === 'jogador'
                  ? 'Jogador do elenco'
                  : user.role === 'admin'
                  ? 'Administrador'
                  : 'Membro cadastrado'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  user.role === 'sócio'
                    ? 'bg-emerald-500/10 border-emerald-400 text-emerald-700'
                    : user.role === 'jogador'
                    ? 'bg-sky-500/10 border-sky-400 text-sky-700'
                    : user.role === 'admin'
                    ? 'bg-purple-500/10 border-purple-400 text-purple-700'
                    : 'bg-neutral-100 border-neutral-300 text-neutral-700'
                }`}
              >
                {user.role === 'sócio'
                  ? 'Selo: Sócio'
                  : user.role === 'jogador'
                  ? 'Selo: Jogador'
                  : user.role === 'admin'
                  ? 'Selo: Admin'
                  : 'Selo: Membro'}
              </span>
            </div>
          </div>
        </Card>

        {/* Carteirinha de sócio */}
        {user.role === 'sócio' && (
          <Card className="p-6 border-2 border-orange-500/50 bg-gradient-to-br from-orange-50 to-neutral-50">
            <h2 className="font-bold text-lg text-neutral-900 mb-4">Carteirinha de sócio</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white rounded-xl border border-neutral-200">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0 aspect-square">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover object-center" />
                ) : (
                  <span className="text-3xl font-bold text-neutral-400">
                    {(user.nome || user.email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="font-bold text-neutral-900">
                  {user.nome} {user.sobrenome}
                </p>
                <p className="text-sm text-neutral-500">{user.email}</p>
                {user.cpf && <p className="text-sm text-neutral-600 mt-1"><span className="font-semibold">CPF:</span> {user.cpf}</p>}
                {user.data_nascimento && <p className="text-sm text-neutral-600"><span className="font-semibold">Nascimento:</span> {new Date(user.data_nascimento).toLocaleDateString('pt-BR')}</p>}
                {(user.cep || user.logradouro || user.numero || user.bairro) && (
                  <p className="text-sm text-neutral-600 mt-1">
                    <span className="font-semibold">Endereço:</span>{' '}
                    {[user.logradouro, user.numero, user.bairro].filter(Boolean).join(', ')}
                    {user.cep && ` — CEP: ${user.cep}`}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-700 font-semibold">
                    Carteira de Sócio
                  </span>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-semibold">
                    Status: Ativo (definido pelo admin)
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Estatísticas do jogador */}
        {user.role === 'jogador' && (
          <Card className="p-6 bg-white border border-neutral-200">
            <h2 className="font-bold text-lg text-neutral-900 mb-4">Painel do jogador</h2>
            {loadingPlayerStats ? (
              <p className="text-sm text-neutral-500">Carregando estatísticas...</p>
            ) : !playerStats ? (
              <p className="text-sm text-neutral-500">
                Ainda não encontramos um registro de jogador vinculado ao seu nome.
                Peça para o admin configurar suas estatísticas na área de elenco.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Nome</p>
                  <p className="font-semibold text-neutral-900">{playerStats.nome}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Número</p>
                  <p className="font-semibold text-neutral-900">{playerStats.numero}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Posição</p>
                  <p className="font-semibold text-neutral-900">{playerStats.posicao}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Idade</p>
                  <p className="font-semibold text-neutral-900">
                    {playerStats.idade ? `${playerStats.idade} anos` : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Gols marcados</p>
                  <p className="font-semibold text-neutral-900">
                    {Number(playerStats.gols) || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Assistências</p>
                  <p className="font-semibold text-neutral-900">
                    {Number(playerStats.assists) || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Nível</p>
                  <p className="font-semibold text-neutral-900">
                    {playerStats.nivel ? `${playerStats.nivel}/10` : '—'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Foto e dados pessoais */}
        <Card className="p-6">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Dados pessoais</h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center ring-2 ring-neutral-300">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover object-center" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover object-center" />
                  ) : (
                    <span className="text-4xl font-bold text-neutral-400">
                      {(user.nome || user.email)[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarUrl || avatarPreview ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
                <p className="text-xs text-neutral-500 mt-1">JPG, PNG, WebP ou GIF. Máx. 2 MB.</p>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                  <Input
                    label="Sobrenome"
                    value={sobrenome}
                    onChange={(e) => setSobrenome(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Email"
                  value={user.email}
                  disabled
                  className="bg-neutral-100 cursor-not-allowed"
                />
                <Input
                  label="Telefone"
                  placeholder="(51) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
                <Input
                  label="CPF"
                  value={user.cpf || ''}
                  disabled
                  className="bg-neutral-100 cursor-not-allowed"
                />
                <Input
                  label="Data de nascimento"
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                />
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                />
                <Input
                  label="Logradouro"
                  placeholder="Rua, avenida..."
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Número"
                    placeholder="Nº"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                  <Input
                    label="Bairro"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-neutral-800 mt-6 mb-3">Suas redes sociais</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Instagram"
                placeholder="https://instagram.com/seu_perfil"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
              <Input
                label="Facebook"
                placeholder="https://facebook.com/seu_perfil"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
              />
              <Input
                label="TikTok"
                placeholder="https://tiktok.com/@seu_perfil"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
              />
            </div>

            <Button type="submit" isLoading={saving} className="mt-4">
              Salvar alterações
            </Button>
          </form>
        </Card>

        {/* Alterar senha */}
        <Card className="p-6">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Alterar senha</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              type="password"
              label="Senha atual"
              placeholder="••••••••"
              value={passwordCurrent}
              onChange={(e) => setPasswordCurrent(e.target.value)}
            />
            <Input
              type="password"
              label="Nova senha"
              placeholder="••••••••"
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
              minLength={6}
            />
            <Input
              type="password"
              label="Confirmar nova senha"
              placeholder="••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              minLength={6}
            />
            <Button type="submit" isLoading={passwordSaving} variant="secondary">
              Alterar senha
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
