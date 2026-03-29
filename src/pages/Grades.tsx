import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Event, Room } from '../types/index.js';

export const Grades: React.FC = () => {
  const { user } = useAuth();
  const [myGrades, setMyGrades] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchData = async () => {
    try {
      const [g, e, r] = await Promise.all([
        api.grades.my(),
        api.events.list(),
        api.rooms.list()
      ]);

      // Sort grades by event date and time
      const sortedGrades = [...g].sort((a, b) => {
        const eventA = e.find(ev => ev.id === a.event_id);
        const eventB = e.find(ev => ev.id === b.event_id);
        if (!eventA || !eventB) return 0;
        const dateTimeA = `${eventA.date}T${eventA.time}`;
        const dateTimeB = `${eventB.date}T${eventB.time}`;
        return dateTimeB.localeCompare(dateTimeA);
      });

      setMyGrades(sortedGrades);
      setEvents(e);
      setRooms(r);
    } catch (err) {
      console.error('Failed to fetch grades', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchData();
    }
  }, [user]);

  if (user?.role !== 'STUDENT') {
    return <div className="p-8 text-center text-slate-500 font-medium">Access Denied</div>;
  }

  return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">My Grades</h2>
          <p className="text-slate-500 font-medium">View your academic performance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myGrades.map((grade) => {
            const event = events.find(e => e.id === grade.event_id);
            const room = rooms.find(r => r.id === event?.room_id);
            return (
                <motion.div
                    key={grade.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <BookOpen size={32} />
                    </div>
                    <div className="text-4xl font-black text-indigo-600 group-hover:scale-110 transition-transform">
                      {grade.grade}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xl mb-4">{event?.description || 'Unknown Class'}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Calendar size={14} className="text-indigo-400" />
                      {event?.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Clock size={14} className="text-indigo-400" />
                      {event?.time}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={14} className="text-indigo-400" />
                      {room?.name}
                    </div>
                  </div>
                  {grade.comment && (
                      <div className="mt-6 pt-6 border-t border-slate-100 italic text-slate-500 text-sm">
                        "{grade.comment}"
                      </div>
                  )}
                </motion.div>
            );
          })}
          {myGrades.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
                No grades recorded yet
              </div>
          )}
        </div>
      </div>
  );
};
