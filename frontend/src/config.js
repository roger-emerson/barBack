// In production (Docker), use relative URLs since frontend is served by backend
// In development, use explicit localhost URLs
const isProduction = import.meta.env.PROD;

export const API_URL = isProduction
  ? ''
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const WS_URL = isProduction
  ? `ws://${window.location.host}`
  : (import.meta.env.VITE_WS_URL || 'ws://localhost:3001');
