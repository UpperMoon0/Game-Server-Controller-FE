import React from 'react'
import type { Node } from '../../types/api'

interface NodeInfoCardProps {
  node: Node
  initializing: boolean
  onInitialize: () => void
  onEdit: () => void
}

export const NodeInfoCard: React.FC<NodeInfoCardProps> = ({
  node,
  initializing,
  onInitialize,
  onEdit,
}) => {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Node Information</h2>
        <div className="flex gap-2">
          {!node.initialized && (
            <button 
              onClick={onInitialize}
              disabled={initializing}
              className="btn btn-primary flex items-center gap-2"
            >
              {initializing ? (
                <>
                  <div className="spinner w-4 h-4" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Initialize
                </>
              )}
            </button>
          )}
          <button 
            onClick={onEdit}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Node ID</p>
          <p className="text-white text-sm font-mono truncate">{node.id}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Name</p>
          <p className="text-white">{node.name}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Game Type</p>
          <p className="text-neon-cyan">{node.game_type || '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Port</p>
          <p className="text-white">{node.port}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Version</p>
          <p className="text-white">{node.version || '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Agent Version</p>
          <p className="text-white">{node.agent_version || '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Heartbeat Interval</p>
          <p className="text-white">{node.heartbeat_interval ? `${node.heartbeat_interval}s` : '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Last Heartbeat</p>
          <p className="text-white">{node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Created At</p>
          <p className="text-white">{node.created_at ? new Date(node.created_at).toLocaleString() : '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Updated At</p>
          <p className="text-white">{node.updated_at ? new Date(node.updated_at).toLocaleString() : '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Started At</p>
          <p className="text-white">{node.started_at ? new Date(node.started_at).toLocaleString() : '-'}</p>
        </div>
        <div className="bg-dark-500 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Initialized</p>
          <p className={node.initialized ? 'text-neon-green' : 'text-neon-yellow'}>
            {node.initialized ? 'Yes' : 'No'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default NodeInfoCard
