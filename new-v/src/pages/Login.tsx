import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.auth.login(email, password);
      login(data.token, data.user);
      navigate('/requests');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50"
      >
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">3D<span className="text-indigo-600">PRINT</span></h1>
          <p className="text-slate-500 font-medium">С возвращением, пожалуйста, войдите в систему</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Эл. адрес</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            <LogIn size={20} /> Войти
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-medium">
          Еще нет аккаунта? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Зарегистрироваться</Link>
        </p>
      </motion.div>
    </div>
  );
};
