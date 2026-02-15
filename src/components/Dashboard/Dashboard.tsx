import { useEffect, useState } from 'react'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import { toast } from '../../store/toast/toastStore'
import type { CreateNodeRequest } from '../../types/api'
import { NodeModal } from '../NodeManager/NodeModal'

export const Dashboard: React.FC = () => {
  const { nodes, fetchNodes, createNode, loading: nodesLoading } = useNodesStore()
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false)

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  const runningNodes = (nodes || []).filter(n => n.status === 'running').length
  const stoppedNodes = (nodes || []).filter(n => n.status === 'stopped' || n.status === 'offline').length

  const handleCreateNode = async (data: CreateNodeRequest) => {
    const success = await createNode(data)
    if (success) {
      setIsNodeModalOpen(false)
      fetchNodes() // Refresh the list
      toast.success('Node created successfully! Waiting for node agent to register.')
    } else {
      const error = useNodesStore.getState().error
      toast.error(error || 'Failed to create node')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor your game server infrastructure</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span>Live</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Nodes"
          value={(nodes || []).length}
          subtitle={`${runningNodes} running`}
          icon="nodes"
          color="cyan"
        />
        <StatCard
          title="Running Nodes"
          value={runningNodes}
          subtitle="Active game servers"
          icon="servers"
          color="green"
        />
        <StatCard
          title="Stopped Nodes"
          value={stoppedNodes}
          subtitle="Offline or stopped"
          icon="cpu"
          color="purple"
        />
        <StatCard
          title="Errors"
          value={(nodes || []).filter(n => n.status === 'error').length}
          subtitle="Nodes with errors"
          icon="memory"
          color="pink"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-neon-cyan rounded-full" />
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setIsNodeModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Node
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Logs
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Nodes */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-neon-purple rounded-full" />
            Recent Nodes
          </h2>
          <div className="space-y-3">
            {(nodes || []).slice(0, 5).map(node => (
              <div key={node.id} className="flex items-center justify-between p-4 bg-dark-600 rounded-lg border border-dark-400 hover:border-neon-purple/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">{node.name}</p>
                    <p className="text-sm text-gray-500">{node.game_type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  node.status === 'running' ? 'status-online' : 
                  node.status === 'error' ? 'status-offline' : 'status-stopped'
                }`}>
                  {node.status}
                </span>
              </div>
            ))}
            {(nodes || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No nodes found
              </div>
            )}
          </div>
        </div>

        {/* Nodes by Game Type */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-neon-green rounded-full" />
            Nodes by Game Type
          </h2>
          <div className="space-y-3">
            {Object.entries(
              (nodes || []).reduce((acc, node) => {
                acc[node.game_type] = (acc[node.game_type] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([gameType, count]) => (
              <div key={gameType} className="flex items-center justify-between p-4 bg-dark-600 rounded-lg border border-dark-400 hover:border-neon-green/30 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white capitalize">{gameType}</p>
                    <p className="text-sm text-gray-500">Game type</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neon-green">
                    {count} node{count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
            {(nodes || []).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No nodes found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Node Modal */}
      <NodeModal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        onSubmit={handleCreateNode}
        loading={nodesLoading}
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: 'nodes' | 'servers' | 'cpu' | 'memory'
  color: 'cyan' | 'green' | 'purple' | 'pink'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    cyan: {
      bg: 'bg-dark-600',
      border: 'border-neon-cyan/30',
      icon: 'text-neon-cyan',
      shadow: 'hover:shadow-neon-cyan',
      gradient: 'from-neon-cyan/20 to-transparent'
    },
    green: {
      bg: 'bg-dark-600',
      border: 'border-neon-green/30',
      icon: 'text-neon-green',
      shadow: 'hover:shadow-neon-green',
      gradient: 'from-neon-green/20 to-transparent'
    },
    purple: {
      bg: 'bg-dark-600',
      border: 'border-neon-purple/30',
      icon: 'text-neon-purple',
      shadow: 'hover:shadow-neon-purple',
      gradient: 'from-neon-purple/20 to-transparent'
    },
    pink: {
      bg: 'bg-dark-600',
      border: 'border-neon-pink/30',
      icon: 'text-neon-pink',
      shadow: 'hover:shadow-neon-pink',
      gradient: 'from-neon-pink/20 to-transparent'
    }
  }

  const icons = {
    nodes: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    servers: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    cpu: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    memory: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  }

  const styles = colorClasses[color]

  return (
    <div className={`card ${styles.bg} border ${styles.border} ${styles.shadow} relative overflow-hidden group`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-dark-500 flex items-center justify-center ${styles.icon}`}>
            {icons[icon]}
          </div>
          <div className={`w-2 h-2 rounded-full ${styles.icon.replace('text-', 'bg-')} animate-pulse`} />
        </div>
        
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        <p className="text-gray-500 text-sm">{subtitle}</p>
      </div>
    </div>
  )
}
