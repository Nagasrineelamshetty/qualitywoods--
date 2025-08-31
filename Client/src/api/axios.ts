import axios from 'axios';

// Create Axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // send cookies for refresh token
});

// Clear auth data helper
export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('rememberMe');

  sessionStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');

  delete instance.defaults.headers.common['Authorization'];
};

// Attach access token to every request
instance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('token'); // fallback
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token automatically on 401
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken =
          localStorage.getItem('refreshToken') ||
          sessionStorage.getItem('refreshToken');
        if (!refreshToken) {
          clearAuthData();
          return Promise.reject(error);
        }

        const res = await instance.post(
          '/api/auth/refresh-token',
          { token: refreshToken },
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;

        if (newToken) {
          // Save in same storage type as before
          if (localStorage.getItem('refreshToken')) {
            localStorage.setItem('accessToken', newToken);
          } else {
            sessionStorage.setItem('accessToken', newToken);
          }

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return instance(originalRequest);
        }
      } catch (err) {
        clearAuthData();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

/////////////////////////
// Collaborative Cart APIs
/////////////////////////

export const createSession = (initialItems: any[] = []) =>
  instance.post('/collaboration/create', { initialItems });

export const joinSession = (sessionId: string) =>
  instance.post('/collaboration/join', { sessionId });

export const getSession = (sessionId: string) =>
  instance.get(`/collaboration/${sessionId}`);

export const addItem = (
  sessionId: string,
  item: { productId: string; name: string; price: number; quantity?: number }
) => instance.post('/collaboration/add-item', { sessionId, ...item });

export const updateQuantity = (
  sessionId: string,
  productId: string,
  quantity: number
) => instance.post('/collaboration/update-quantity', { sessionId, productId, quantity });

export const voteItem = (
  sessionId: string,
  productId: string,
  voteType: 'up' | 'down'
) => instance.post('/collaboration/vote', { sessionId, productId, voteType });

export const commentItem = (
  sessionId: string,
  productId: string,
  text: string
) => instance.post('/collaboration/comment', { sessionId, productId, text });

export const getSummary = (sessionId: string, numPeople: number = 1) =>
  instance.get(`/collaboration/${sessionId}/summary?numPeople=${numPeople}`);

export default instance;
