import React, { useState, useEffect } from 'react';
import { Users, Plus, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Group, User } from '../types/index.js';

export const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupStudents, setGroupStudents] = useState<Record<number, User[]>>({});

  const fetchData = async () => {
    try {
      const data = await api.groups.list();
      setGroups(data);
    } catch (err) {
      console.error('Failed to fetch groups', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchGroupStudents = async (id: number) => {
    try {
      const data = await api.groups.getStudents(id);
      setGroupStudents(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error('Failed to fetch group students', err);
    }
  };

  const addGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await api.groups.create({ name: formData.get('name') as string });
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Groups</h2>
        <p className="text-slate-500 font-medium">Manage student cohorts and memberships</p>
      </div>

      {user?.role === 'TEACHER' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" />
            Add New Group
          </h3>
          <form onSubmit={addGroup} className="flex flex-wrap gap-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Group Name (e.g. CS-2024)" 
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              required 
            />
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Add Group
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => (
          <motion.div 
            key={group.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Users size={32} />
              </div>
              <button 
                onClick={() => fetchGroupStudents(group.id)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                View Members <ArrowRight size={12} />
              </button>
            </div>
            <h4 className="font-bold text-slate-800 text-xl mb-1">{group.name}</h4>
            <p className="text-slate-500 font-medium">Group ID: {group.id}</p>
            
            <AnimatePresence>
              {groupStudents[group.id] && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-slate-100 overflow-hidden"
                >
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">Members</p>
                  <ul className="space-y-2">
                    {groupStudents[group.id].map(s => (
                      <li key={s.id} className="text-sm text-slate-600 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="font-medium">{s.name}</span>
                      </li>
                    ))}
                    {groupStudents[group.id].length === 0 && <li className="text-xs text-slate-400 italic">No members assigned yet</li>}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
