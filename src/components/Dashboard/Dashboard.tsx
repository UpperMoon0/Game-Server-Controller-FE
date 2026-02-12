import React, { useEffect, useState } from 'react'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import { useServersStore } from '../../store/servers/serversSlice'
import { clusterApi } from '../../services/api'
import type { ClusterMetrics, ServerCounts } from '../../types/api'

export const Dashboard: React.FC = () => {
  const { nodes } = useNodesStore()
  const { servers } = useServersStore()
  const [clusterMetrics, setClusterMetrics] = useState<ClusterMetrics | null>(null)
  const [serverCounts, setServerCounts] = useState<ServerCounts | null>(null)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await clusterApi.getMetrics()
        setClusterMetrics(data.nodes)
        setServerCounts(data.servers)
      } catch (error) {
        console.error('Failed to load cluster metrics:', error)
      }
    }
    loadMetrics()
  }, [])

  const onlineNodes = nodes.filter(n => n.status === 'online').length
  const runningServers = servers.filter(s => s.status === 'running').length

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Nodes"
          value={nodes.length}
          subtitle={`${onlineNodes} online`}
          color="blue"
        />
        <StatCard
          title="Total Servers"
          value={servers.length}
          subtitle={`${runningServers} running`}
          color="green"
        />
        <StatCard
          title="CPU Usage"
          value={clusterMetrics ? `${Math.round(clusterMetrics.used_cpu_cores)}%` : 'N/A'}
          subtitle={`of ${clusterMetrics?.total_cpu_cores || 0} cores`}
          color="yellow"
        />
        <StatCard
          title="Memory Usage"
          value={clusterMetrics ? `${Math.round(clusterMetrics.used_memory_mb)}%` : 'N/A'}
          subtitle={`of ${clusterMetrics?.total_memory_mb || 0} MB`}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Node
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Create Server
          </button>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            View Logs
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Nodes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Nodes</h2>
          <div className="space-y-3">
            {nodes.slice(0, 5).map(node => (
              <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{node.name}</p>
                  <p className="text-sm text-gray-500">{node.hostname}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  node.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Servers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Servers</h2>
          <div className="space-y-3">
            {servers.slice(0, 5).map(server => (
              <div key={server.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{server.name}</p>
                  <p className="text-sm text-gray-500">{server.game_type}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    server.status === 'running' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {server.status}
                  </p>
                  <p className="text-xs text-gray-500">{server.player_count} players</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-10 h-10 ${colorClasses[color]} rounded-full mb-3`} />
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  )
}
