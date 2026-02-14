import React, { useEffect, useState } from 'react'
import { useServersStore } from '../../store/servers/serversSlice'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import type { Server, CreateServerRequest } from '../../types/api'
import { ServerModal } from './ServerModal'

export const ServerList: React.FC = () => {
  const { servers, loading, error, fetchServers, createServer, deleteServer, serverAction } = useServersStore()
  const { nodes, fetchNodes } = useNodesStore()
  const [filter, setFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null)
  const [actioningServerId, setActioningServerId] = useState<string | null>(null)

  useEffect(() => {
    fetchServers()
    fetchNodes()
  }, [fetchServers, fetchNodes])

  const filteredServers = filter === 'all'
    ? servers
    : servers.filter(s => s.status === filter)

  const handleCreateServer = () => {
    setIsModalOpen(true)
  }

  const handleModalSubmit = async (data: CreateServerRequest) => {
    const result = await createServer(data)
    if (result) {
      setIsModalOpen(false)
    }
  }

  const handleDeleteServer = async (serverId: string) => {
    setDeletingServerId(serverId)
    const success = await deleteServer(serverId)
    if (success) {
      setDeletingServerId(null)
    }
  }

  const handleServerAction = async (serverId: string, action: string) => {
    setActioningServerId(serverId)
    const success = await serverAction(serverId, action)
    if (success) {
      setActioningServerId(null)
    }
  }

  if (loading && servers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-neon-red/30 bg-dark-700">
        <div className="flex items-center gap-3 text-neon-red">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Servers</h1>
          <p className="text-gray-400 mt-1">Manage your game servers</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="installing">Installing</option>
            <option value="error">Error</option>
          </select>
          <button 
            onClick={handleCreateServer}
            className="btn btn-success flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Server
          </button>
        </div>
      </div>

      {/* Servers Table */}
      <div className="table-container overflow-hidden">
        <table className="min-w-full">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-4 text-left">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  Name
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  Game Type
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Players
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-neon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Address
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredServers.map(server => (
              <ServerRow 
                key={server.id} 
                server={server} 
                onDelete={() => handleDeleteServer(server.id)}
                onAction={(action) => handleServerAction(server.id, action)}
                isDeleting={deletingServerId === server.id}
                isActioning={actioningServerId === server.id}
              />
            ))}
          </tbody>
        </table>

        {filteredServers.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-lg">No servers found</p>
            <p className="text-gray-500 text-sm mt-1">Create a new server to get started</p>
          </div>
        )}
      </div>

      {/* Server Modal */}
      <ServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        nodes={nodes}
        loading={loading}
      />
    </div>
  )
}

interface ServerRowProps {
  server: Server
  onDelete: () => void
  onAction: (action: string) => void
  isDeleting: boolean
  isActioning: boolean
}

const ServerRow: React.FC<ServerRowProps> = ({ server, onDelete, onAction, isDeleting, isActioning }) => {
  const statusConfig = {
    running: {
      status: 'status-online',
      dot: 'bg-neon-green',
      text: 'text-neon-green'
    },
    stopped: {
      status: 'status-stopped',
      dot: 'bg-gray-400',
      text: 'text-gray-400'
    },
    installing: {
      status: 'status-installing',
      dot: 'bg-neon-cyan',
      text: 'text-neon-cyan'
    },
    error: {
      status: 'status-error',
      dot: 'bg-neon-red',
      text: 'text-neon-red'
    },
    starting: {
      status: 'status-installing',
      dot: 'bg-neon-yellow',
      text: 'text-neon-yellow'
    },
    stopping: {
      status: 'status-installing',
      dot: 'bg-neon-orange',
      text: 'text-neon-orange'
    },
    updating: {
      status: 'status-installing',
      dot: 'bg-neon-purple',
      text: 'text-neon-purple'
    },
    backing_up: {
      status: 'status-installing',
      dot: 'bg-neon-blue',
      text: 'text-neon-blue'
    }
  }

  const config = statusConfig[server.status] || statusConfig.stopped
  const isLoading = isDeleting || isActioning

  return (
    <tr className="table-row hover:bg-dark-600 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-white">{server.name}</div>
            <div className="text-sm text-gray-500 font-mono">ID: {server.id.slice(0, 8)}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-dark-500 text-neon-purple text-xs rounded">{server.game_type}</span>
          <span className="text-sm text-gray-400">v{server.version}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.status}`}>
            {server.status}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-dark-500 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full"
              style={{ width: `${(server.player_count / server.max_players) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-300">
            <span className="text-neon-pink">{server.player_count}</span>
            <span className="text-gray-500">/{server.max_players}</span>
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-300 font-mono">
          {server.ip_address}:{server.port}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onAction('start')}
            disabled={isLoading || server.status === 'running'}
            className="p-2 rounded-lg text-neon-green hover:bg-dark-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Start"
          >
            {isActioning ? (
              <div className="spinner w-4 h-4" />
            ) : (
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button 
            onClick={() => onAction('stop')}
            disabled={isLoading || server.status === 'stopped'}
            className="p-2 rounded-lg text-neon-red hover:bg-dark-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Stop"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button 
            onClick={() => onAction('restart')}
            disabled={isLoading}
            className="p-2 rounded-lg text-neon-yellow hover:bg-dark-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Restart"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            onClick={onDelete}
            disabled={isLoading}
            className="p-2 rounded-lg text-gray-400 hover:text-neon-red hover:bg-dark-500 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
          >
            {isDeleting ? (
              <div className="spinner w-4 h-4" />
            ) : (
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}
