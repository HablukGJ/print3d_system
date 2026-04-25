import React, { useState, useEffect } from 'react';
import { Plus, Clock, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.js';
import { PrintRequest } from '../types/index.js';

export const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      full_name: formData.get('full_name') as string,
      student_group: formData.get('student_group') as string,
      comment: formData.get('comment') as string
    };

    try {
      await api.requests.create(data);
      setShowForm(false);
      fetchRequests();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.requests.updateStatus(id, 'archived');
      fetchRequests();
    } catch (err: any) {
      alert(err.message);
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
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Print Requests</h2>
            <p className="text-slate-500 font-medium">Create and track your 3D printing jobs</p>
          </div>
          <div className="flex gap-2">
            <button
                onClick={() => setShowArchive(!showArchive)}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all border ${showArchive ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
            >
              <Clock size={20} />
              {showArchive ? 'Hide Archive' : 'View Archive'}
            </button>
            {!showArchive && (
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <Plus size={20} />
                  {showForm ? 'Cancel' : 'New Request'}
                </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showForm && (
              <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
              >
                <form onSubmit={handleCreateRequest} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">FIO (Full Name)</label>
                      <input name="full_name" className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" placeholder="Ivanov Ivan Ivanovich" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Group</label>
                      <input name="student_group" className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" placeholder="P-202" required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Comment / Details</label>
                    <textarea name="comment" className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px]" placeholder="Dimensions, material, or any specific instructions..." />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">Submit Request</button>
                </form>
              </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4">
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
                      className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 ${request.status === 'archived' ? 'opacity-70' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">Request #{request.id}</h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                          <Clock size={14} /> {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.comment && (
                            <p className="mt-2 text-slate-600 text-sm line-clamp-2 max-w-md">{request.comment}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                      <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </div>
                      {request.status !== 'archived' && (
                          <button
                              onClick={() => handleArchive(request.id)}
                              className="text-slate-400 hover:text-slate-600 font-bold text-sm underline decoration-slate-200 underline-offset-4"
                          >
                            Archive
                          </button>
                      )}
                      {request.status === 'completed' && (
                          <div className="text-emerald-500">
                            <CheckCircle2 size={24} />
                          </div>
                      )}
                    </div>
                  </motion.div>
              ))
          ) : (
              <div className="text-center py-20 bg-slate-100/50 rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 font-bold text-xl">
                  {showArchive ? 'Archive is empty' : 'No active requests'}
                </p>
                <p className="text-slate-400 font-medium">
                  {showArchive ? 'Archived items will appear here' : 'Create your first 3D printing job above'}
                </p>
              </div>
          )}
        </div>
      </div>
  );
};
