import React from 'react';
import { User as UserIcon, ShieldCheck, ArrowRightLeft, LogOut, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const Profile: React.FC = () => {
  const { user, logout, login } = useAuth();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newName = formData.get('name') as string;
    try {
      const updatedUser = await api.profile.update(newName);
      const token = localStorage.getItem('token')!;
      login(token, updatedUser);
      alert('Profile updated!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete your account? This action is permanent and will delete all your print requests.')) {
      return;
    }

    try {
      await api.profile.delete();
      alert('Account deleted successfully.');
      logout(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSwitchAccount = (acc: { token: string, user: any }) => {
    login(acc.token, acc.user);
    window.location.reload(); // Simple way to refresh state
  };

  const handleRemoveAccount = (email: string) => {
    const recent = JSON.parse(localStorage.getItem('recentAccounts') || '[]');
    const filtered = recent.filter((acc: any) => acc.user.email !== email);
    localStorage.setItem('recentAccounts', JSON.stringify(filtered));
    window.location.reload();
  };

  const recentAccounts = JSON.parse(localStorage.getItem('recentAccounts') || '[]');

  return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Профиль</h2>
          <p className="text-slate-500 font-medium">Управление настройками аккаунта</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-200">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-800">{user?.name}</h2>
                  <p className="text-slate-500 flex items-center gap-2">
                    {user?.role === 'ADMIN' ? <ShieldCheck size={16} className="text-indigo-600" /> : <UserIcon size={16} className="text-indigo-600" />}
                    {user?.role === 'USER' ? 'Пользователь' : 'Админ'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500 uppercase font-bold">Email</p>
                  <p className="text-slate-800 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Редактировать профиль</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Полное имя</label>
                    <input
                        type="text"
                        name="name"
                        defaultValue={user?.name}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                    Применить изменения
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft size={24} className="text-indigo-600" />
                  Сменить аккаунт
                </h3>
                <button
                    onClick={() => logout()}
                    className="text-slate-500 font-bold hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <LogOut size={16} /> Выйти
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentAccounts.map((acc: any) => (
                    <button
                        key={acc.user.email}
                        onClick={() => handleSwitchAccount(acc)}
                        disabled={acc.user.email === user?.email}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${acc.user.email === user?.email ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-300 hover:bg-slate-50'}`}
                    >
                      <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-600">
                        {acc.user.name.charAt(0)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">{acc.user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{acc.user.email}</p>
                      </div>
                      {acc.user.email === user?.email ? (
                          <div className="bg-indigo-600 w-2 h-2 rounded-full" />
                      ) : (
                          <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAccount(acc.user.email);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                      )}
                    </button>
                ))}
                <button
                    onClick={() => logout(false)}
                    className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                  <Plus size={20} />
                  <span className="font-bold">Добавить аккаунт</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm shadow-rose-50/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-rose-600 flex items-center gap-2">
                    <Trash2 size={24} />
                    Опасная зона
                  </h3>
                  <p className="text-slate-500 text-sm pr-1">После удаления аккаунта вернуть его будет невозможно. Пожалуйста, убедитесь, что вы все сделали правильно.</p>
                </div>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                >
                  Удалить аккаунт
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
