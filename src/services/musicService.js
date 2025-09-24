import axios from 'axios';

const API_BASE_URL = '/api'; // Use your backend's port

// A helper function to create authenticated requests
const createAuthenticatedRequest = (endpoint) => {
    // Get the token that was stored during login
    const token = localStorage.getItem('token');
    
    // If there's no token, the user isn't logged in, so we can't fetch protected data.
    if (!token) {
        console.error(`Authentication error: No token found for endpoint ${endpoint}`);
        // Return a promise that resolves to an object with an empty data array
        return Promise.resolve({ data: [] }); 
    }
    
    // Create the request with the Authorization header
    return axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { 
            'Authorization': `Bearer ${token}` 
        }
    });
};

// --- Exported Functions that now use the helper ---

export const fetchAllTracks = async () => (await createAuthenticatedRequest('/tracks')).data;
export const fetchAllAlbums = async () => (await createAuthenticatedRequest('/albums')).data;
export const fetchAllArtists = async () => (await createAuthenticatedRequest('/artists')).data;
export const fetchAllPlaylists = async () => (await createAuthenticatedRequest('/playlists')).data;
export const fetchFeaturedPlaylists = async () => (await createAuthenticatedRequest('/playlists/featured')).data;
export const fetchTrendingArtists = async () => (await createAuthenticatedRequest('/artists/trending')).data;

export const searchAll = async (query) => {
    if (!query) {
        return { tracks: [], artists: [], albums: [], playlists: [] };
    }
    const response = await createAuthenticatedRequest(`/search?q=${query}`);
    return response.data;
};

export const getTrackStreamUrl = async (trackId) => {
    const response = await createAuthenticatedRequest(`/tracks/${trackId}/stream`);
    return response.data.url;
};

