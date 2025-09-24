import axios from 'axios';

// Prefer env in Docker/Nginx, default to local dev if not provided
const API_BASE_URL = '/api';

// Single axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized GET with auth-required behavior
const getOrEmpty = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // No token → align with your current behavior: return empty data
    console.error(`Authentication error: No token found for endpoint ${endpoint}`);
    return { data: [] };
  }
  return api.get(endpoint, options);
};

// Music data APIs
export const fetchAllTracks = async () => (await getOrEmpty('/tracks')).data;
export const fetchAllAlbums = async () => (await getOrEmpty('/albums')).data;
export const fetchAllArtists = async () => (await getOrEmpty('/artists')).data;
export const fetchAllPlaylists = async () => (await getOrEmpty('/playlists')).data;
export const fetchFeaturedPlaylists = async () => (await getOrEmpty('/playlists/featured')).data;
export const fetchTrendingArtists = async () => (await getOrEmpty('/artists/trending')).data;

// Search
export const searchAll = async (query) => {
  if (!query) {
    return { tracks: [], artists: [], albums: [], playlists: [] };
  }
  const res = await getOrEmpty(`/search`, { params: { q: query } });
  return res.data;
};

// Streaming URL
export const getTrackStreamUrl = async (trackId) => {
  const res = await getOrEmpty(`/tracks/${trackId}/stream`);
  return res.data.url;
};
