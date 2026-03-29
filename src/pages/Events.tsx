import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, BookOpen, Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Event, Room, Group } from '../types/index.js';

export const Events: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [gradingEvent, setGradingEvent] = useState<Event | null>(null);
  const [eventGrades, setEventGrades] = useState<Record<number, any>>({});
  const [groupStudents, setGroupStudents] = useState<Record<number, any[]>>({});

  const fetchData = async () => {
    try {
      const [e, r, g] = await Promise.all([
        api.events.list(),
        api.rooms.list(),
        api.groups.list()
      ]);

      // Sort events by date and time (ascending)
      const sortedEvents = [...e].sort((a, b) => {
        const dateTimeA = `${a.date}T${a.time}`;
        const dateTimeB = `${b.date}T${b.time}`;
        return dateTimeB.localeCompare(dateTimeA);
      });

      setEvents(sortedEvents);
      setRooms(r);
      setGroups(g);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchEventGrades = async (eventId: number) => {
    try {
      const data = await api.events.getGrades(eventId);
      const gradeMap = data.reduce((acc: any, g: any) => ({ ...acc, [g.student_id]: g }), {});
      setEventGrades(gradeMap);
    } catch (err) {
      console.error('Failed to fetch event grades', err);
    }
  };

  const fetchGroupStudents = async (id: number) => {
    try {
      const data = await api.groups.getStudents(id);
      setGroupStudents(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error('Failed to fetch group students', err);
    }
  };

  const saveGrade = async (eventId: number, studentId: number, grade: number, comment: string) => {
    try {
      await api.grades.save({ event_id: eventId, student_id: studentId, grade, comment });
      fetchEventGrades(eventId);
    } catch (err) {
      console.error('Failed to save grade', err);
    }
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newEvent = {
      teacher_id: user?.id!,
      group_id: Number(formData.get('group_id')),
      room_id: Number(formData.get('room_id')),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      description: formData.get('description') as string
    };

    try {
      await api.events.create(newEvent);
      fetchData();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Schedule</h2>
            <p className="text-slate-500 font-medium">Manage and view upcoming classes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                  <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                          <span className="text-xs uppercase leading-none">{event.date.split('-')[1]}</span>
                          <span className="text-xl leading-none">{event.date.split('-')[2]}</span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {event.description}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                              <Clock size={16} className="text-indigo-400" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                              <MapPin size={16} className="text-indigo-400" />
                              {rooms.find(r => r.id === event.room_id)?.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                              <Users size={16} className="text-indigo-400" />
                              {groups.find(g => g.id === event.group_id)?.name}
                            </div>
                          </div>
                        </div>
                      </div>
                      {user?.role === 'TEACHER' && (
                          <button
                              onClick={() => {
                                setGradingEvent(event);
                                fetchEventGrades(event.id);
                                fetchGroupStudents(event.group_id);
                              }}
                              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                          >
                            <BookOpen size={16} /> Grade
                          </button>
                      )}
                    </div>
                  </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {user?.role === 'TEACHER' && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Plus size={24} className="text-indigo-600" />
                    New Class
                  </h3>
                  <form onSubmit={addEvent} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                      <input name="description" placeholder="e.g. Advanced Mathematics" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Date</label>
                        <input name="date" type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Time</label>
                        <input name="time" type="time" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Room</label>
                      <select name="room_id" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                        {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Group</label>
                      <select name="group_id" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white" required>
                        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                      Create Event
                    </button>
                  </form>
                </div>
              </div>
          )}
        </div>

        {/* Grading Modal */}
        <AnimatePresence>
          {gradingEvent && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                  <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{gradingEvent.description}</h3>
                      <p className="text-indigo-100 text-sm">Grading for {groups.find(g => g.id === gradingEvent.group_id)?.name}</p>
                    </div>
                    <button onClick={() => setGradingEvent(null)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                      {groupStudents[gradingEvent.group_id]?.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                                {student.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{student.name}</p>
                                <p className="text-xs text-slate-500">{student.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(num => (
                                      <button
                                          key={num}
                                          onClick={() => saveGrade(gradingEvent.id, student.id, num, '')}
                                          className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                                              eventGrades[student.id]?.grade === num
                                                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                  : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                          }`}
                                      >
                                        {num}
                                      </button>
                                  ))}
                                </div>
                                {eventGrades[student.id] && (
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase mt-1">Graded</span>
                                )}
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
};
