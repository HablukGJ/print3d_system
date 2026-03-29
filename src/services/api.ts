import { User, Room, Group, Event, Grade } from '../types/index.js';

const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const fetchJson = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    try {
      if (isJson) {
        const data = await res.json();
        errorMessage = data.error || data.message || errorMessage;
      } else {
        const text = await res.text();
        errorMessage = text || errorMessage;
      }
    } catch (e) {
      // Ignore parsing errors for error messages
    }
    throw new Error(errorMessage);
  }

  if (isJson) {
    return res.json();
  }
  return res.text();
};

export const api = {
  auth: {
    login: (email: string, password: string) => 
      fetchJson(`${API_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      }),
    register: (data: any) => 
      fetchJson(`${API_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },
  profile: {
    update: (name: string) => 
      fetchJson(`${API_URL}/profile`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
      })
  },
  rooms: {
    list: () => fetchJson(`${API_URL}/rooms`),
    create: (data: Partial<Room>) => fetchJson(`${API_URL}/rooms`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Room>) => fetchJson(`${API_URL}/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetchJson(`${API_URL}/rooms/${id}`, { method: 'DELETE' })
  },
  groups: {
    list: () => fetchJson(`${API_URL}/groups`),
    create: (data: Partial<Group>) => fetchJson(`${API_URL}/groups`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Group>) => fetchJson(`${API_URL}/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetchJson(`${API_URL}/groups/${id}`, { method: 'DELETE' }),
    getStudents: (id: number) => fetchJson(`${API_URL}/students/group/${id}`)
  },
  events: {
    list: () => fetchJson(`${API_URL}/events`),
    create: (data: Partial<Event>) => fetchJson(`${API_URL}/events`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Event>) => fetchJson(`${API_URL}/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => fetchJson(`${API_URL}/events/${id}`, { method: 'DELETE' }),
    getGrades: (id: number) => fetchJson(`${API_URL}/grades/event/${id}`)
  },
  students: {
    list: () => fetchJson(`${API_URL}/students`),
    updateGroup: (id: number, groupId: number | null) => 
      fetchJson(`${API_URL}/students/${id}/group`, {
        method: 'PATCH',
        body: JSON.stringify({ group_id: groupId })
      })
  },
  grades: {
    save: (data: Partial<Grade>) => fetchJson(`${API_URL}/grades`, { method: 'POST', body: JSON.stringify(data) }),
    my: () => fetchJson(`${API_URL}/grades/my`)
  }
};
