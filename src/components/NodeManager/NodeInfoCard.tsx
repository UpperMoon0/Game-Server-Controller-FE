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
  const formatRelativeTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  const formatGameType = (gameType: string | undefined) => {
    if (!gameType || gameType.trim() === '') return 'N/A'
    return gameType
  }

  const formatVersion = (version: string | undefined) => {
    if (!version || version.trim() === '') return 'N/A'
    return version
  }

  const formatAgentVersion = (agentVersion: string | undefined) => {
    if (!agentVersion || agentVersion.trim() === '') return 'N/A'
    return agentVersion
  }

  const formatPort = (port: number | undefined) => {
    if (port === undefined || port === null || port === 0) return 'N/A'
    return port.toString()
  }

  const formatHeartbeatInterval = (interval: number | undefined) => {
    if (!interval || interval === 0) return 'N/A'
    return `${interval}s`
  }

  const formatNodeId = (id: string | undefined) => {
    if (!id || id.trim() === '') return 'N/A'
    return id
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5 pointer-events-none" />
      
      {/* Main card */}
      <div className="relative card p-0 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-dark-700 to-dark-600 p-6 border-b border-dark-500">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Quick Info */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Game Type Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-cyan/10 border border-neon-cyan/30">
                <svg className="w-4 h-4 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-neon-cyan font-medium">{formatGameType(node.game_type)}</span>
              </div>
              
              {/* Initialization Badge */}
              {node.initialized ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-green/10 border border-neon-green/30">
                  <svg className="w-4 h-4 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-neon-green font-medium">Initialized</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-yellow/10 border border-neon-yellow/30">
                  <svg className="w-4 h-4 text-neon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-neon-yellow font-medium">Not Initialized</span>
                </div>
              )}
            </div>
            
            {/* Right: Actions */}
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
        </div>
        
        {/* Info Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Node ID */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Node ID
              </div>
              <div className="text-white text-sm font-mono bg-dark-600 px-3 py-1.5 rounded-md truncate group-hover:bg-dark-500 transition-colors" title={formatNodeId(node.id)}>
                {node.id ? `${node.id.substring(0, 8)}...` : 'N/A'}
              </div>
            </div>
            
            {/* Port */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-4.071A7.934 7.934 0 0112 16c2.438 0 4.682.868 6.419 2.336M6.714 17.071A9.935 9.935 0 0112 14c2.905 0 5.582 1.05 7.614 2.786M5.25 17.812A11.985 11.985 0 0112 14c3.183 0 6.103.99 8.5 2.686" />
                </svg>
                Port
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors">
                {formatPort(node.port)}
              </div>
            </div>
            
            {/* Version */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Version
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors">
                {formatVersion(node.version)}
              </div>
            </div>
            
            {/* Agent Version */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                Agent Version
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors">
                {formatAgentVersion(node.agent_version)}
              </div>
            </div>
            
            {/* Heartbeat Interval */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Heartbeat
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors">
                {formatHeartbeatInterval(node.heartbeat_interval)}
              </div>
            </div>
            
            {/* Last Heartbeat */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last Heartbeat
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors" title={node.last_heartbeat ? new Date(node.last_heartbeat).toLocaleString() : ''}>
                {formatRelativeTime(node.last_heartbeat)}
              </div>
            </div>
            
            {/* Created At */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Created
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors" title={node.created_at ? new Date(node.created_at).toLocaleString() : ''}>
                {node.created_at ? new Date(node.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            
            {/* Updated At */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Updated
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors" title={node.updated_at ? new Date(node.updated_at).toLocaleString() : ''}>
                {formatRelativeTime(node.updated_at)}
              </div>
            </div>
            
            {/* Started At */}
            <div className="group">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Started
              </div>
              <div className="text-white text-sm bg-dark-600 px-3 py-1.5 rounded-md group-hover:bg-dark-500 transition-colors" title={node.started_at ? new Date(node.started_at).toLocaleString() : ''}>
                {formatRelativeTime(node.started_at || undefined)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NodeInfoCard