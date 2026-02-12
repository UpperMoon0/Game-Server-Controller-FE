import React, { useEffect, useState } from 'react'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import type { Node } from '../../types/api'

export const NodeList: React.FC = () => {
  const { nodes, loading, error, fetchNodes, removeNode } = useNodesStore()
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  const filteredNodes = filter === 'all' 
    ? nodes 
    : nodes.filter(n => n.status === filter)

  if (loading) {
    return <div>Loading nodes...</div>
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Nodes</h1>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map(node => (
          <NodeCard key={node.id} node={node} onDelete={() => removeNode(node.id)} />
        ))}
      </div>

      {filteredNodes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No nodes found
        </div>
      )}
    </div>
  )
}

interface NodeCardProps {
  node: Node
  onDelete: () => void
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onDelete }) => {
  const statusColors = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    unknown: 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{node.name}</h3>
          <p className="text-gray-500 text-sm">{node.hostname}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[node.status]}`}>
          {node.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">IP Address</span>
          <span>{node.ip_address}:{node.port}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">CPU Cores</span>
          <span>{node.available_cpu_cores}/{node.total_cpu_cores}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Memory</span>
          <span>{Math.round(node.available_memory_mb / 1024)}/{Math.round(node.total_memory_mb / 1024)} GB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Game Types</span>
          <span>{node.game_types.join(', ')}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex gap-2">
        <button className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 text-sm">
          Details
        </button>
        <button className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 text-sm">
          Actions
        </button>
        <button 
          onClick={onDelete}
          className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
