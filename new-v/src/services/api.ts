import { User, PrintRequest, RequestStatus } from '../types/index.js';

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
        }),
    delete: () =>
        fetchJson(`${API_URL}/profile`, {
          method: 'DELETE'
        })
  },
  requests: {
    list: (): Promise<PrintRequest[]> => fetchJson(`${API_URL}/requests`),
    create: (data: { full_name: string, student_group: string, comment: string }) =>
        fetchJson(`${API_URL}/requests`, {
          method: 'POST',
          body: JSON.stringify(data)
        }),
    updateStatus: (id: number, status: RequestStatus) =>
        fetchJson(`${API_URL}/requests/${id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        })
  }
};
