import React, { useEffect, useState } from 'react'
import { useServersStore } from '../../store/servers/serversSlice'
import type { Server } from '../../types/api'

export const ServerList: React.FC = () => {
  const { servers, loading, error, fetchServers, removeServer } = useServersStore()
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchServers()
  }, [fetchServers])

  const filteredServers = filter === 'all'
    ? servers
    : servers.filter(s => s.status === filter)

  if (loading) {
    return <div>Loading servers...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Servers</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="installing">Installing</option>
            <option value="error">Error</option>
          </select>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create Server
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Game Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Players
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredServers.map(server => (
              <ServerRow 
                key={server.id} 
                server={server} 
                onDelete={() => removeServer(server.id)}
              />
            ))}
          </tbody>
        </table>

        {filteredServers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No servers found
          </div>
        )}
      </div>
    </div>
  )
}

interface ServerRowProps {
  server: Server
  onDelete: () => void
}

const ServerRow: React.FC<ServerRowProps> = ({ server, onDelete }) => {
  const statusColors = {
    running: 'bg-green-100 text-green-800',
    stopped: 'bg-gray-100 text-gray-800',
    installing: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    starting: 'bg-yellow-100 text-yellow-800',
    stopping: 'bg-yellow-100 text-yellow-800',
    updating: 'bg-purple-100 text-purple-800',
    backing_up: 'bg-indigo-100 text-indigo-800'
  }

  const handleAction = async (action: string) => {
    // TODO: Implement server actions
    console.log(`Action: ${action} on server: ${server.id}`)
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{server.name}</div>
        <div className="text-sm text-gray-500">ID: {server.id.slice(0, 8)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-gray-900">{server.game_type}</span>
        <span className="text-sm text-gray-500 ml-1">v{server.version}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[server.status]}`}>
          {server.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {server.player_count}/{server.max_players}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {server.ip_address}:{server.port}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button 
            onClick={() => handleAction('start')}
            className="text-green-600 hover:text-green-900"
          >
            Start
          </button>
          <button 
            onClick={() => handleAction('stop')}
            className="text-red-600 hover:text-red-900"
          >
            Stop
          </button>
          <button 
            onClick={() => handleAction('restart')}
            className="text-yellow-600 hover:text-yellow-900"
          >
            Restart
          </button>
          <button 
            onClick={onDelete}
            className="text-gray-600 hover:text-gray-900"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
