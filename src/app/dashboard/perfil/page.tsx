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

  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setSobrenome(user.sobrenome || '');
      setTelefone(user.telefone || '');
      setAvatarUrl(user.avatar_url || '');
      setInstagramUrl((user as any).instagram_url || '');
      setFacebookUrl((user as any).facebook_url || '');
      setTiktokUrl((user as any).tiktok_url || '');
    }
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

        {/* Carteirinha de sócio */}
        {user.role === 'sócio' && (
          <Card className="p-6 border-2 border-orange-500/50 bg-gradient-to-br from-orange-50 to-neutral-50">
            <h2 className="font-bold text-lg text-neutral-900 mb-4">Carteirinha de sócio</h2>
            <div className="flex items-center gap-6 p-4 bg-white rounded-xl border border-neutral-200">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center flex-shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-neutral-400">
                    {(user.nome || user.email)[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-neutral-900">{user.nome} {user.sobrenome}</p>
                <p className="text-sm text-neutral-500">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-700 text-xs font-semibold">
                  Sócio ativo
                </span>
              </div>
            </div>
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
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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
