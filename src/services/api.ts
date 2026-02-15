import { invoke } from '@tauri-apps/api/tauri'
import type { 
  Node, 
  NodeMetrics, 
  ClusterMetrics,
  NodeCounts,
  CreateNodeRequest,
  GameType
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
  total: number
  online: number
  offline: number
}

interface NodeResponse {
  node: Node
  message?: string
}

interface NodeMetricsResponse {
  metrics: NodeMetrics
}

interface ClusterMetricsResponse {
  nodes: ClusterMetrics
  node_counts: NodeCounts
}

interface GameTypesResponse {
  game_types: GameType[]
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

  create: async (data: CreateNodeRequest): Promise<NodeResponse> => {
    return await apiCall.post('/api/v1/nodes', data) as NodeResponse
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

  action: async (id: string, action: string, params?: Record<string, string>): Promise<{ message: string; initialized?: boolean }> => {
    const body = { action, ...params }
    return await apiCall.post(`/api/v1/nodes/${id}/action`, body) as { message: string; initialized?: boolean }
  },
}

// Cluster API
export const clusterApi = {
  getMetrics: async (): Promise<{ nodes: ClusterMetrics; node_counts: NodeCounts }> => {
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
export const gameTypesApi = {
  getAll: async (): Promise<GameType[]> => {
    const response = await apiCall.get('/api/v1/game-types') as GameTypesResponse
    return response.game_types
  },
}

// Config API
interface ConfigResponse {
  grpc_advertise_host: string
  grpc_port: number
  grpc_advertise_address: string
}

export const configApi = {
  get: async (): Promise<ConfigResponse> => {
    return await apiCall.get('/api/v1/config') as ConfigResponse
  },

  update: async (data: { grpc_advertise_host?: string }): Promise<ConfigResponse> => {
    return await apiCall.put('/api/v1/config', data) as ConfigResponse
  },
}

export default apiCall
