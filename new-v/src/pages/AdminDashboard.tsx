import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Clock, FileText, CheckCircle2, Loader2, User as UserIcon, MoreVertical, Paperclip, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.js';
import { PrintRequest, RequestStatus } from '../types/index.js';

export const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await api.requests.list();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: number, status: RequestStatus) => {
    setUpdatingId(id);
    try {
      await api.requests.updateStatus(id, status);
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'archived': return 'bg-slate-100 text-slate-500 border-slate-200 grayscale';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredRequests = requests.filter(r =>
      showArchive ? r.status === 'archived' : r.status !== 'archived'
  );

  return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <LayoutDashboard size={32} className="text-indigo-600" />
              Панель администратора
            </h2>
            <p className="text-slate-500 font-medium">Управление всеми входящими запросами на 3D-печать</p>
          </div>
          <button
              onClick={() => setShowArchive(!showArchive)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${showArchive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
          >
            <Clock size={20} />
            {showArchive ? 'Закрыть' : 'Архив'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
              </div>
          ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                  <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 ${request.status === 'archived' ? 'opacity-70' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                          <FileText size={28} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-xl tracking-tight">Request #{request.id}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={14} /> {new Date(request.created_at).toLocaleString()}
                            </p>
                            <span className="text-slate-200">•</span>
                            <p className="text-sm font-bold text-indigo-500 flex items-center gap-1">
                              <UserIcon size={14} /> {request.user_email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(request.status)}`}>
                        {request.status == 'pending' && 'В очереди'}
                        {request.status == 'processing' && 'Начат'}
                        {request.status == 'completed' && 'Выполнен'}
                        {request.status == 'archived' && 'Архивирован'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Отправитель</p>
                          <p className="font-bold text-slate-800">{request.full_name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Группа</p>
                          <p className="font-bold text-slate-800">{request.student_group}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Комментарий</p>
                        <p className="text-slate-600 font-medium whitespace-pre-wrap">{request.comment || 'Пусто'}</p>

                        {request.file_path && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Чертеж</p>
                              <a
                                  href={`/${request.file_path}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-xl text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-all border border-indigo-100 shadow-sm"
                              >
                                <Paperclip size={18} />
                                <span>{request.file_original_name}</span>
                                <Download size={18} className="ml-2" />
                              </a>
                            </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Статус выполнения:</p>
                      <button
                          onClick={() => handleUpdateStatus(request.id, 'pending')}
                          disabled={request.status === 'pending' || updatingId === request.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${request.status === 'pending' ? 'bg-amber-600 text-white shadow-lg shadow-amber-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'}`}
                      >
                        В очереди
                      </button>
                      <button
                          onClick={() => handleUpdateStatus(request.id, 'processing')}
                          disabled={request.status === 'processing' || updatingId === request.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${request.status === 'processing' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
                      >
                        Начат
                      </button>
                      <button
                          onClick={() => handleUpdateStatus(request.id, 'completed')}
                          disabled={request.status === 'completed' || updatingId === request.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${request.status === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                      >
                        Выполнен
                      </button>
                      <button
                          onClick={() => handleUpdateStatus(request.id, 'archived')}
                          disabled={request.status === 'archived' || updatingId === request.id}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${request.status === 'archived' ? 'bg-slate-600 text-white shadow-lg shadow-slate-200' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        Архирирован
                      </button>
                      {updatingId === request.id && <Loader2 className="animate-spin text-slate-400 ml-2" size={20} />}
                    </div>
                  </motion.div>
              ))
          ) : (
              <div className="text-center py-20 bg-slate-100/50 rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold text-xl">{showArchive ? 'Пусто' : 'Нет заявок в очереди'}</p>
                <p className="text-slate-400 font-medium">{showArchive ? 'Здесь появятся старые заявки' : 'Здесь появятся новые заявки'}</p>
              </div>
          )}
        </div>
      </div>
  );
};
