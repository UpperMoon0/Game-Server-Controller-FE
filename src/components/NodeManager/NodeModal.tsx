import React, { useState, useEffect } from 'react'
import type { Node, CreateNodeRequest } from '../../types/api'

interface NodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateNodeRequest) => Promise<void>
  editingNode?: Node | null
  loading?: boolean
}

const defaultFormData: CreateNodeRequest = {
  name: '',
  hostname: '',
  ip_address: '',
  port: 50051,
  game_types: [],
  total_cpu_cores: 4,
  total_memory_mb: 8192,
  total_storage_mb: 102400,
  os_version: ''
}

const availableGameTypes = [
  'minecraft',
  'rust',
  'csgo',
  'ark',
  'valheim',
  'terraria',
  'seven_days',
  'unturned'
]

export const NodeModal: React.FC<NodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingNode,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateNodeRequest>(defaultFormData)
  const [gameTypesInput, setGameTypesInput] = useState<string>('')

  useEffect(() => {
    if (editingNode) {
      setFormData({
        name: editingNode.name,
        hostname: editingNode.hostname,
        ip_address: editingNode.ip_address,
        port: editingNode.port,
        game_types: editingNode.game_types,
        total_cpu_cores: editingNode.total_cpu_cores,
        total_memory_mb: editingNode.total_memory_mb,
        total_storage_mb: editingNode.total_storage_mb,
        os_version: editingNode.os_version || ''
      })
      setGameTypesInput(editingNode.game_types.join(', '))
    } else {
      setFormData(defaultFormData)
      setGameTypesInput('')
    }
  }, [editingNode, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' || name === 'total_cpu_cores' || name === 'total_memory_mb' || name === 'total_storage_mb'
        ? parseInt(value) || 0
        : value
    }))
  }

  const handleGameTypesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGameTypesInput(value)
    const types = value.split(',').map(t => t.trim()).filter(t => t.length > 0)
    setFormData(prev => ({
      ...prev,
      game_types: types
    }))
  }

  const toggleGameType = (gameType: string) => {
    setFormData(prev => {
      const gameTypes = prev.game_types.includes(gameType)
        ? prev.game_types.filter(t => t !== gameType)
        : [...prev.game_types, gameType]
      setGameTypesInput(gameTypes.join(', '))
      return { ...prev, game_types: gameTypes }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-dark-700 border border-dark-400 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-400">
          <h2 className="text-xl font-semibold text-white">
            {editingNode ? 'Edit Node' : 'Add New Node'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Node Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="e.g., node-1, production-node"
            />
          </div>

          {/* Hostname */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Hostname *
            </label>
            <input
              type="text"
              name="hostname"
              value={formData.hostname}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="e.g., node1.example.com"
            />
          </div>

          {/* IP Address and Port */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                IP Address *
              </label>
              <input
                type="text"
                name="ip_address"
                value={formData.ip_address}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="e.g., 192.168.1.100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Port *
              </label>
              <input
                type="number"
                name="port"
                value={formData.port}
                onChange={handleChange}
                required
                min="1"
                max="65535"
                className="input w-full"
              />
            </div>
          </div>

          {/* Game Types */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Game Types *
            </label>
            <input
              type="text"
              value={gameTypesInput}
              onChange={handleGameTypesChange}
              className="input w-full"
              placeholder="e.g., minecraft, rust, csgo"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {availableGameTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleGameType(type)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    formData.game_types.includes(type)
                      ? 'bg-neon-cyan text-dark-900'
                      : 'bg-dark-500 text-gray-300 hover:bg-dark-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                CPU Cores
              </label>
              <input
                type="number"
                name="total_cpu_cores"
                value={formData.total_cpu_cores}
                onChange={handleChange}
                min="1"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Memory (MB)
              </label>
              <input
                type="number"
                name="total_memory_mb"
                value={formData.total_memory_mb}
                onChange={handleChange}
                min="1024"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Storage (MB)
              </label>
              <input
                type="number"
                name="total_storage_mb"
                value={formData.total_storage_mb}
                onChange={handleChange}
                min="1024"
                className="input w-full"
              />
            </div>
          </div>

          {/* OS Version */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              OS Version (optional)
            </label>
            <input
              type="text"
              name="os_version"
              value={formData.os_version || ''}
              onChange={handleChange}
              className="input w-full"
              placeholder="e.g., Ubuntu 22.04"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-dark-400">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || formData.game_types.length === 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="spinner w-4 h-4" />
                  {editingNode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingNode ? 'Update Node' : 'Create Node'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NodeModal
