// API Types

export interface Node {
  id: string
  name: string
  hostname: string
  ip_address: string
  port: number
  status: NodeStatus
  game_types: string[]
  total_cpu_cores: number
  total_memory_mb: number
  total_storage_mb: number
  available_cpu_cores: number
  available_memory_mb: number
  available_storage_mb: number
  os_version: string
  agent_version: string
  heartbeat_interval: number
  last_heartbeat: string
  created_at: string
  updated_at: string
}

export type NodeStatus = 'online' | 'offline' | 'maintenance' | 'unknown'

export interface NodeMetrics {
  node_id: string
  cpu_usage_percent: number
  memory_usage_percent: number
  storage_usage_percent: number
  network_in_bytes: number
  network_out_bytes: number
  active_connections: number
  load_average: number
  timestamp: string
}

export interface Server {
  id: string
  name: string
  node_id: string
  game_type: string
  instance_id: string
  status: ServerStatus
  version: string
  max_players: number
  port: number
  ip_address: string
  player_count: number
  cpu_usage: number
  memory_usage: number
  uptime_seconds: number
  created_at: string
  updated_at: string
}

export type ServerStatus = 'installing' | 'stopped' | 'running' | 'error' | 'updating' | 'starting' | 'stopping' | 'backing_up'

export interface ServerMetrics {
  server_id: string
  player_count: number
  online_players: string[]
  cpu_usage_percent: number
  memory_usage_mb: number
  ticks_per_second: number
  ms_per_tick: number
  network_bytes_in: number
  network_bytes_out: number
  uptime_seconds: number
  average_ping_ms: number
  timestamp: string
}

export interface ClusterMetrics {
  total_nodes: number
  online_nodes: number
  offline_nodes: number
  total_cpu_cores: number
  used_cpu_cores: number
  total_memory_mb: number
  used_memory_mb: number
}

export interface ServerCounts {
  running: number
  stopped: number
  installing: number
  error: number
  total: number
}

export interface CreateServerRequest {
  node_id: string
  game_type: string
  config: {
    name: string
    version: string
    max_players: number
    settings: Record<string, string>
  }
  requirements: {
    min_cpu_cores: number
    min_memory_mb: number
    min_storage_mb: number
  }
}

export interface CreateServerResponse {
  success: boolean
  server_id: string
  message: string
  server_info: {
    server_id: string
    node_id: string
    port: number
    ip_address: string
  }
}

export interface ServerActionRequest {
  action: 'start' | 'stop' | 'restart' | 'reinstall' | 'backup'
}

export interface CreateNodeRequest {
  name: string
  hostname: string
  ip_address: string
  port: number
  game_type: string
  total_cpu_cores: number
  total_memory_mb: number
  total_storage_mb: number
  os_version?: string
}
