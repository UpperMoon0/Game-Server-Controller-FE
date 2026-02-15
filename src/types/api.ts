// API Types

export type NodeStatus = 'installing' | 'stopped' | 'running' | 'error' | 'updating' | 'starting' | 'stopping' | 'offline' | 'maintenance'

// Node represents a game server node (stored in database)
export interface Node {
  id: string
  name: string
  status: NodeStatus
  game_type: string
  version: string
  port: number
  initialized: boolean
  
  // Agent Connection
  agent_version: string
  heartbeat_interval: number
  last_heartbeat: string
  
  // Timestamps
  created_at: string
  updated_at: string
  started_at: string | null
}

// NodeMetrics represents real-time metrics (fetched from node agent, not stored in DB)
export interface NodeMetrics {
  node_id: string
  player_count: number
  cpu_usage_percent: number
  memory_usage_percent: number
  memory_usage_mb: number
  uptime_seconds: number
  timestamp: string
}

export interface ClusterMetrics {
  total_nodes: number
  online_nodes: number
  offline_nodes: number
}

export interface NodeCounts {
  running: number
  stopped: number
  installing: number
  error: number
  total: number
}

export interface CreateNodeRequest {
  name: string
  game_type: string
  version?: string
  port?: number
}

export interface UpdateNodeRequest {
  name?: string
  game_type?: string
  version?: string
  port?: number
  status?: NodeStatus
  heartbeat_interval?: number
}

export interface NodeActionRequest {
  action: 'start' | 'stop' | 'restart' | 'reinstall'
}

export interface GameType {
  id: string
  name: string
  description: string
  default_port: number
}
