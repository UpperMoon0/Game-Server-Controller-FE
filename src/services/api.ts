import axios from 'axios'
import type { 
  Node, 
  NodeMetrics, 
  Server, 
  ServerMetrics, 
  ClusterMetrics,
  ServerCounts,
  CreateServerRequest,
  CreateServerResponse,
  CreateNodeRequest 
} from '../types/api'

// Default URL, will be overridden by settings
const DEFAULT_API_URL = 'http://localhost:8080'

// Create axios instance with dynamic base URL
const createApi = (baseUrl: string = DEFAULT_API_URL) => {
  return axios.create({
    baseURL: baseUrl,
    timeout: 30000,
  })
}

// Default API instance
let api = createApi()

// Function to update the base URL
export const setApiBaseUrl = (url: string) => {
  api = createApi(url)
}

// Function to get current API instance
export const getApi = () => api

// Nodes API
export const nodesApi = {
  getAll: async (status?: string): Promise<Node[]> => {
    const params = status ? { status } : {}
    const response = await api.get('/api/v1/nodes', { params })
    return response.data.nodes
  },

  getById: async (id: string): Promise<Node> => {
    const response = await api.get(`/api/v1/nodes/${id}`)
    return response.data
  },

  create: async (data: CreateNodeRequest): Promise<Node> => {
    const response = await api.post('/api/v1/nodes', data)
    return response.data.node
  },

  update: async (id: string, data: Partial<Node>): Promise<Node> => {
    const response = await api.put(`/api/v1/nodes/${id}`, data)
    return response.data.node
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/nodes/${id}`)
  },

  getMetrics: async (id: string): Promise<NodeMetrics> => {
    const response = await api.get(`/api/v1/nodes/${id}/metrics`)
    return response.data.metrics
  },
}

// Servers API
export const serversApi = {
  getAll: async (filters?: Record<string, string>): Promise<Server[]> => {
    const response = await api.get('/api/v1/servers', { params: filters })
    return response.data.servers
  },

  getById: async (id: string): Promise<Server> => {
    const response = await api.get(`/api/v1/servers/${id}`)
    return response.data
  },

  create: async (data: CreateServerRequest): Promise<CreateServerResponse> => {
    const response = await api.post('/api/v1/servers', data)
    return response.data
  },

  update: async (id: string, data: Partial<Server>): Promise<Server> => {
    const response = await api.put(`/api/v1/servers/${id}`, data)
    return response.data.server
  },

  delete: async (id: string, backup?: boolean): Promise<void> => {
    await api.delete(`/api/v1/servers/${id}`, { params: { backup } })
  },

  action: async (id: string, action: string): Promise<void> => {
    await api.post(`/api/v1/servers/${id}/action`, { action })
  },

  getLogs: async (id: string, tail?: number): Promise<string[]> => {
    const response = await api.get(`/api/v1/servers/${id}/logs`, { 
      params: { tail: tail || 100 } 
    })
    return response.data.logs
  },

  getMetrics: async (id: string): Promise<ServerMetrics> => {
    const response = await api.get(`/api/v1/servers/${id}/metrics`)
    return response.data.metrics
  },
}

// Cluster API
export const clusterApi = {
  getMetrics: async (): Promise<{ nodes: ClusterMetrics; servers: ServerCounts }> => {
    const response = await api.get('/api/v1/metrics')
    return response.data
  },
}

// Health API
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const response = await api.get('/health')
    return response.data
  },

  ready: async (): Promise<{ status: string }> => {
    const response = await api.get('/ready')
    return response.data
  },
}

export default api
