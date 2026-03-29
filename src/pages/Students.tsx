import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRightLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { User, Group } from '../types/index.js';

export const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchData = async () => {
    try {
      const [s, g] = await Promise.all([
        api.students.list(),
        api.groups.list()
      ]);
      setStudents(s);
      setGroups(g);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'TEACHER') {
      fetchData();
    }
  }, [user]);

  const updateStudentGroup = async (studentId: number, newGroupId: number | null) => {
    try {
      await api.students.updateGroup(studentId, newGroupId);
      fetchData();
    } catch (err) {
      console.error('Failed to update student group', err);
    }
  };

  if (user?.role !== 'TEACHER') {
    return <div className="p-8 text-center text-slate-500 font-medium">Access Denied</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Students</h2>
        <p className="text-slate-500 font-medium">Manage student group assignments</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Group</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <motion.tr 
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                        {student.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.group_id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      {groups.find(g => g.id === student.group_id)?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={16} className="text-slate-400" />
                      <select 
                        value={student.group_id || ''} 
                        onChange={(e) => updateStudentGroup(student.id, e.target.value ? Number(e.target.value) : null)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Unassign</option>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
