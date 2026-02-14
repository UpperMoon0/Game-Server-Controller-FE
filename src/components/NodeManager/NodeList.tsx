import React, { useEffect, useState } from 'react'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import type { Node, CreateNodeRequest } from '../../types/api'
import { NodeModal } from './NodeModal'

export const NodeList: React.FC = () => {
  const { nodes, loading, error, fetchNodes, createNode, updateNodeData, deleteNode } = useNodesStore()
  const [filter, setFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null)

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  const filteredNodes = filter === 'all' 
    ? nodes 
    : nodes.filter(n => n.status === filter)

  const handleAddNode = () => {
    setEditingNode(null)
    setIsModalOpen(true)
  }

  const handleEditNode = (node: Node) => {
    setEditingNode(node)
    setIsModalOpen(true)
  }

  const handleDeleteNode = async (nodeId: string) => {
    setDeletingNodeId(nodeId)
    const success = await deleteNode(nodeId)
    if (success) {
      setDeletingNodeId(null)
    }
  }

  const handleModalSubmit = async (data: CreateNodeRequest) => {
    if (editingNode) {
      await updateNodeData(editingNode.id, data)
    } else {
      await createNode(data)
    }
    setIsModalOpen(false)
    setEditingNode(null)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingNode(null)
  }

  if (loading && nodes.length === 0) {
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
          <h1 className="text-3xl font-bold text-white">Nodes</h1>
          <p className="text-gray-400 mt-1">Manage your game server nodes</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="select"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button 
            onClick={handleAddNode}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Node
          </button>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNodes.map(node => (
          <NodeCard 
            key={node.id} 
            node={node} 
            onEdit={() => handleEditNode(node)}
            onDelete={() => handleDeleteNode(node.id)}
            isDeleting={deletingNodeId === node.id}
          />
        ))}
      </div>

      {filteredNodes.length === 0 && (
        <div className="card text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <p className="text-gray-400 text-lg">No nodes found</p>
          <p className="text-gray-500 text-sm mt-1">Add a new node to get started</p>
        </div>
      )}

      {/* Node Modal */}
      <NodeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingNode={editingNode}
        loading={loading}
      />
    </div>
  )
}

interface NodeCardProps {
  node: Node
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}

const NodeCard: React.FC<NodeCardProps> = ({ node, onEdit, onDelete, isDeleting }) => {
  const statusConfig = {
    online: {
      bg: 'bg-dark-600',
      border: 'border-neon-green/30',
      text: 'text-neon-green',
      status: 'status-online',
      shadow: 'hover:shadow-neon-green'
    },
    offline: {
      bg: 'bg-dark-600',
      border: 'border-neon-red/30',
      text: 'text-neon-red',
      status: 'status-offline',
      shadow: 'hover:shadow-neon-red'
    },
    maintenance: {
      bg: 'bg-dark-600',
      border: 'border-neon-yellow/30',
      text: 'text-neon-yellow',
      status: 'status-maintenance',
      shadow: 'hover:shadow-neon-yellow'
    },
    unknown: {
      bg: 'bg-dark-600',
      border: 'border-gray-500/30',
      text: 'text-gray-400',
      status: 'status-stopped',
      shadow: ''
    }
  }

  const config = statusConfig[node.status] || statusConfig.unknown

  return (
    <div className={`card ${config.bg} border ${config.border} ${config.shadow} group`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-dark-500 flex items-center justify-center">
            <svg className={`w-6 h-6 ${config.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">{node.name}</h3>
            <p className="text-gray-500 text-sm">{node.hostname}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.status}`}>
          {node.status}
        </span>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center py-2 border-b border-dark-400">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            IP Address
          </span>
          <span className="text-white font-mono text-sm">{node.ip_address}:{node.port}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-dark-400">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            CPU Cores
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-dark-500 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                style={{ width: `${((node.total_cpu_cores - node.available_cpu_cores) / node.total_cpu_cores) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm">{node.available_cpu_cores}/{node.total_cpu_cores}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-dark-400">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Memory
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-dark-500 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-neon-pink to-neon-purple rounded-full"
                style={{ width: `${((node.total_memory_mb - node.available_memory_mb) / node.total_memory_mb) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm">{Math.round(node.available_memory_mb / 1024)}/{Math.round(node.total_memory_mb / 1024)} GB</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            Game Types
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            {node.game_types.map(type => (
              <span key={type} className="px-2 py-0.5 bg-dark-500 text-neon-cyan text-xs rounded">
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-dark-400">
        <button 
          onClick={onEdit}
          className="btn btn-primary flex-1 text-sm py-2"
        >
          Edit
        </button>
        <button className="btn btn-secondary flex-1 text-sm py-2">
          Actions
        </button>
        <button 
          onClick={onDelete}
          disabled={isDeleting}
          className="btn btn-danger py-2 px-3 text-sm disabled:opacity-50"
        >
          {isDeleting ? (
            <div className="spinner w-4 h-4" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
