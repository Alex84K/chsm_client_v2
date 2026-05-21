import axios from 'axios';
import { apiUrl } from './apiConfig';
import { currentOrgId } from '../utils/getOrganisationsUtils';

void currentOrgId;

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
