import axios from 'axios';

// API Base URL - Backend server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('❌ API Error:', error.message);
        return Promise.reject(error);
    }
);

// ==================== Health Check ====================
export const checkHealth = async () => {
    const response = await api.get('/health');
    return response.data;
};

// ==================== Teams API ====================
export const getTeams = async (params = {}) => {
    const response = await api.get('/teams', { params });
    return response.data;
};

export const getTeamById = async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
};

export const getTeamMatches = async (id, params = {}) => {
    const response = await api.get(`/teams/${id}/matches`, { params });
    return response.data;
};

export const getTeamPlayers = async (id) => {
    const response = await api.get(`/teams/${id}/players`);
    return response.data;
};

// ==================== Players API ====================
export const getPlayers = async (params = {}) => {
    const response = await api.get('/players', { params });
    return response.data;
};

export const getPlayerById = async (id) => {
    const response = await api.get(`/players/${id}`);
    return response.data;
};

export const getPlayerBatting = async (id, params = {}) => {
    const response = await api.get(`/players/${id}/batting`, { params });
    return response.data;
};

export const getPlayerBowling = async (id, params = {}) => {
    const response = await api.get(`/players/${id}/bowling`, { params });
    return response.data;
};

// ==================== Matches API ====================
export const getMatches = async (params = {}) => {
    const response = await api.get('/matches', { params });
    return response.data;
};

export const getMatchById = async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
};

export const getMatchScorecard = async (id) => {
    const response = await api.get(`/matches/${id}/scorecard`);
    return response.data;
};

export const getVenues = async () => {
    const response = await api.get('/matches/venues/list');
    return response.data;
};

// ==================== Stats API ====================
export const getStandings = async (params = {}) => {
    const response = await api.get('/stats/standings', { params });
    return response.data;
};

export const getTopBatsmen = async (params = {}) => {
    const response = await api.get('/stats/top-batsmen', { params });
    return response.data;
};

export const getTopBowlers = async (params = {}) => {
    const response = await api.get('/stats/top-bowlers', { params });
    return response.data;
};

export const getSummary = async () => {
    const response = await api.get('/stats/summary');
    return response.data;
};

export const getTeamPerformance = async () => {
    const response = await api.get('/stats/team-performance');
    return response.data;
};

export default api;
