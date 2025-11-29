import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    const apiKey = Cookies.get('api_key');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear tokens
      Cookies.remove('auth_token');
      Cookies.remove('api_key');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface AttackRequest {
  attack_type: string;
  target_url?: string;
  intensity?: number;
  duration?: number;
  parameters?: Record<string, any>;
}

export interface AttackResponse {
  attack_id: string;
  status: string;
  message: string;
  timestamp: string;
  estimated_duration?: number;
}

export interface DefenseStatus {
  defense_id: string;
  status: string;
  blocked_attacks: number;
  total_attacks: number;
  success_rate: number;
  active_defenses: string[];
  timestamp: string;
}

export interface LogEntry {
  log_id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  category: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface Statistics {
  total_attacks: number;
  blocked_attacks: number;
  success_rate: number;
  average_latency: number;
  attack_types: Record<string, number>;
  defense_mechanisms: Record<string, number>;
  time_series: Array<{
    timestamp: string;
    attacks: number;
    blocked: number;
    latency: number;
  }>;
}

export interface DefenseMechanism {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  settings?: Record<string, any>;
  stats?: {
    blocked?: number;
    success_rate?: number;
    response_time?: number;
  };
}

export interface DefenseConfig {
  mechanisms: DefenseMechanism[];
  global_settings?: Record<string, any>;
}

// API Functions
export const api = {
  // Authentication
  async login(username: string, password: string): Promise<{ token: string }> {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  async setApiKey(apiKey: string): Promise<void> {
    Cookies.set('api_key', apiKey, { expires: 7 });
  },

  // Attack Simulation
  async simulateAttack(attackData: AttackRequest): Promise<AttackResponse> {
    const response = await apiClient.post('/api/attacks/simulate', attackData);
    return response.data;
  },

  async getAttackStatus(attackId: string): Promise<AttackResponse> {
    const response = await apiClient.get(`/api/attacks/${attackId}`);
    return response.data;
  },

  async getAttackHistory(): Promise<AttackResponse[]> {
    const response = await apiClient.get('/api/attacks/history');
    return response.data;
  },

  // Defense Monitoring
  async getDefenseStatus(): Promise<DefenseStatus> {
    const response = await apiClient.get('/api/defense/status');
    return response.data;
  },

  async getDefenseHistory(): Promise<DefenseStatus[]> {
    const response = await apiClient.get('/api/defense/history');
    return response.data;
  },

  // Logs
  async getLogs(limit?: number, level?: string): Promise<LogEntry[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (level) params.append('level', level);
    
    const response = await apiClient.get(`/api/logs?${params.toString()}`);
    return response.data;
  },

  async getLogsStream(): Promise<EventSource> {
    const token = Cookies.get('auth_token') || Cookies.get('api_key');
    return new EventSource(`${API_URL}/api/logs/stream?token=${token}`);
  },

  // Statistics
  async getStatistics(timeRange?: string): Promise<Statistics> {
    const params = timeRange ? `?time_range=${timeRange}` : '';
    const response = await apiClient.get(`/api/statistics${params}`);
    return response.data;
  },

  // Defense Control
  async getDefenseConfig(): Promise<DefenseConfig> {
    const response = await apiClient.get('/api/defense/config');
    return response.data;
  },

  async updateDefenseMechanism(
    mechanismId: string,
    updates: { enabled?: boolean; settings?: Record<string, any> }
  ): Promise<DefenseMechanism> {
    const response = await apiClient.put(`/api/defense/mechanism/${mechanismId}`, updates);
    return response.data;
  },

  async enableDefense(mechanismId: string): Promise<void> {
    await apiClient.post(`/api/defense/mechanism/${mechanismId}/enable`);
  },

  async disableDefense(mechanismId: string): Promise<void> {
    await apiClient.post(`/api/defense/mechanism/${mechanismId}/disable`);
  },

  // Port Scanner
  async scanPorts(scanData: {
    target_url: string;
    ports?: number[];
    scan_type?: 'common' | 'all' | 'custom';
  }): Promise<PortScanResult> {
    const response = await apiClient.post('/api/scan/ports', scanData);
    return response.data;
  },

  // Attack History
  async getAttackHistory(limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/api/attacks/history${params}`);
    return response.data;
  },
};

export interface PortScanResult {
  scan_id: string;
  target: string;
  host: string;
  open_ports: Array<{ port: number; service: string; status: string }>;
  closed_ports: number[];
  filtered_ports: number[];
  total_scanned: number;
  duration: number;
  timestamp: string;
  port_details: Array<{
    port: number;
    service: string;
    status: string;
    protocol: string;
  }>;
}

export default apiClient;

