import { invoke } from '@tauri-apps/api/tauri'
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

// Generic API methods using Tauri BFF
const apiCall = {
  get: async (endpoint: string): Promise<unknown> => {
    return await invoke('api_get', { endpoint })
  },
  
  post: async (endpoint: string, body: unknown = {}): Promise<unknown> => {
    return await invoke('api_post', { endpoint, body })
  },
  
  put: async (endpoint: string, body: unknown = {}): Promise<unknown> => {
    return await invoke('api_put', { endpoint, body })
  },
  
  delete: async (endpoint: string): Promise<unknown> => {
    return await invoke('api_delete', { endpoint })
  }
}

// Response types for API calls
interface NodesResponse {
  nodes: Node[]
}

interface NodeResponse {
  node: Node
}

interface ServersResponse {
  servers: Server[]
}

interface ServerResponse {
  server: Server
}

interface NodeMetricsResponse {
  metrics: NodeMetrics
}

interface ServerMetricsResponse {
  metrics: ServerMetrics
}

interface ClusterMetricsResponse {
  nodes: ClusterMetrics
  servers: ServerCounts
}

interface LogsResponse {
  logs: string[]
}

// Nodes API
export const nodesApi = {
  getAll: async (status?: string): Promise<Node[]> => {
    const endpoint = status ? `/api/v1/nodes?status=${status}` : '/api/v1/nodes'
    const response = await apiCall.get(endpoint) as NodesResponse
    return response.nodes
  },

  getById: async (id: string): Promise<Node> => {
    return await apiCall.get(`/api/v1/nodes/${id}`) as Node
  },

  create: async (data: CreateNodeRequest): Promise<Node> => {
    const response = await apiCall.post('/api/v1/nodes', data) as NodeResponse
    return response.node
  },

  update: async (id: string, data: Partial<Node>): Promise<Node> => {
    const response = await apiCall.put(`/api/v1/nodes/${id}`, data) as NodeResponse
    return response.node
  },

  delete: async (id: string): Promise<void> => {
    await apiCall.delete(`/api/v1/nodes/${id}`)
  },

  getMetrics: async (id: string): Promise<NodeMetrics> => {
    const response = await apiCall.get(`/api/v1/nodes/${id}/metrics`) as NodeMetricsResponse
    return response.metrics
  },
}

// Servers API
export const serversApi = {
  getAll: async (filters?: Record<string, string>): Promise<Server[]> => {
    const queryString = filters 
      ? '?' + new URLSearchParams(filters).toString() 
      : ''
    const response = await apiCall.get(`/api/v1/servers${queryString}`) as ServersResponse
    return response.servers
  },

  getById: async (id: string): Promise<Server> => {
    return await apiCall.get(`/api/v1/servers/${id}`) as Server
  },

  create: async (data: CreateServerRequest): Promise<CreateServerResponse> => {
    return await apiCall.post('/api/v1/servers', data) as CreateServerResponse
  },

  update: async (id: string, data: Partial<Server>): Promise<Server> => {
    const response = await apiCall.put(`/api/v1/servers/${id}`, data) as ServerResponse
    return response.server
  },

  delete: async (id: string, backup?: boolean): Promise<void> => {
    const endpoint = backup 
      ? `/api/v1/servers/${id}?backup=${backup}` 
      : `/api/v1/servers/${id}`
    await apiCall.delete(endpoint)
  },

  action: async (id: string, action: string): Promise<void> => {
    await apiCall.post(`/api/v1/servers/${id}/action`, { action })
  },

  getLogs: async (id: string, tail?: number): Promise<string[]> => {
    const endpoint = `/api/v1/servers/${id}/logs?tail=${tail || 100}`
    const response = await apiCall.get(endpoint) as LogsResponse
    return response.logs
  },

  getMetrics: async (id: string): Promise<ServerMetrics> => {
    const response = await apiCall.get(`/api/v1/servers/${id}/metrics`) as ServerMetricsResponse
    return response.metrics
  },
}

// Cluster API
export const clusterApi = {
  getMetrics: async (): Promise<{ nodes: ClusterMetrics; servers: ServerCounts }> => {
    return await apiCall.get('/api/v1/metrics') as ClusterMetricsResponse
  },
}

// Health API
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    return await apiCall.get('/health') as { status: string }
  },

  ready: async (): Promise<{ status: string }> => {
    return await apiCall.get('/ready') as { status: string }
  },
}

// Game Types API
export interface GameType {
  id: string
  name: string
  description: string
  default_port: number
}

interface GameTypesResponse {
  game_types: GameType[]
}

export const gameTypesApi = {
  getAll: async (): Promise<GameType[]> => {
    const response = await apiCall.get('/api/v1/game-types') as GameTypesResponse
    return response.game_types
  },
}

export default apiCall
