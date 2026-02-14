import React, { useState, useEffect } from 'react'
import type { Node, CreateNodeRequest } from '../../types/api'
import { gameTypesApi, GameType } from '../../services/api'

interface NodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateNodeRequest) => Promise<void>
  editingNode?: Node | null
  loading?: boolean
}

const defaultFormData: CreateNodeRequest = {
  name: '',
  port: 8080,
  game_type: ''
}

export const NodeModal: React.FC<NodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingNode,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateNodeRequest>(defaultFormData)
  const [gameTypes, setGameTypes] = useState<GameType[]>([])
  const [loadingGameTypes, setLoadingGameTypes] = useState(false)

  // Fetch game types from backend
  useEffect(() => {
    const fetchGameTypes = async () => {
      setLoadingGameTypes(true)
      try {
        const types = await gameTypesApi.getAll()
        setGameTypes(types)
        // Set default game type if available
        if (types.length > 0 && !formData.game_type) {
          setFormData(prev => ({ ...prev, game_type: types[0].id }))
        }
      } catch (error) {
        console.error('Failed to fetch game types:', error)
        setGameTypes([])
      } finally {
        setLoadingGameTypes(false)
      }
    }
    
    if (isOpen) {
      fetchGameTypes()
    }
  }, [isOpen])

  useEffect(() => {
    if (editingNode) {
      setFormData({
        name: editingNode.name,
        port: editingNode.port,
        game_type: editingNode.game_type || ''
      })
    } else {
      // Reset to default but preserve game_type if it was already set
      setFormData(prev => ({
        ...defaultFormData,
        game_type: prev.game_type || ''
      }))
    }
  }, [editingNode, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'port' ? parseInt(value) || 0 : value
    }))
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

          {/* Port */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Port
            </label>
            <input
              type="number"
              name="port"
              value={formData.port}
              onChange={handleChange}
              min="1"
              max="65535"
              className="input w-full"
              placeholder="e.g., 8080"
            />
            <p className="text-gray-500 text-xs mt-1">
              The port for the node agent to communicate with the controller
            </p>
          </div>

          {/* Game Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Game Type *
            </label>
            <select
              name="game_type"
              value={formData.game_type}
              onChange={handleChange}
              required
              disabled={loadingGameTypes || gameTypes.length === 0}
              className="select w-full"
            >
              {loadingGameTypes ? (
                <option value="">Loading...</option>
              ) : gameTypes.length === 0 ? (
                <option value="">No game types available</option>
              ) : (
                gameTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))
              )}
            </select>
            {gameTypes.find(t => t.id === formData.game_type)?.description && (
              <p className="text-gray-500 text-xs mt-1">
                {gameTypes.find(t => t.id === formData.game_type)?.description}
              </p>
            )}
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
              disabled={loading || !formData.game_type}
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
