import React, { useState, useEffect } from 'react';
import { DoorOpen, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Room } from '../types/index.js';

export const Rooms: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchData = async () => {
    try {
      const data = await api.rooms.list();
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await api.rooms.create({ 
        name: formData.get('name') as string, 
        capacity: Number(formData.get('capacity')) 
      });
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Rooms</h2>
        <p className="text-slate-500 font-medium">Manage campus facilities and capacities</p>
      </div>

      {user?.role === 'TEACHER' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-indigo-600" />
            Add New Room
          </h3>
          <form onSubmit={addRoom} className="flex flex-wrap gap-4">
            <input 
              type="text" 
              name="name" 
              placeholder="Room Name (e.g. Lab 101)" 
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              required 
            />
            <input 
              type="number" 
              name="capacity" 
              placeholder="Capacity" 
              className="w-32 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
              required 
            />
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Add Room
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => (
          <motion.div 
            key={room.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <DoorOpen size={32} />
            </div>
            <h4 className="font-bold text-slate-800 text-xl mb-1">{room.name}</h4>
            <p className="text-slate-500 font-medium">Capacity: {room.capacity} people</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
