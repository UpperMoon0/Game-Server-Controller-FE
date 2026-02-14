import React, { useState, useEffect } from 'react'
import type { CreateServerRequest, Node } from '../../types/api'

interface ServerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateServerRequest) => Promise<void>
  nodes: Node[]
  loading?: boolean
}

const availableGameTypes = [
  { id: 'minecraft', name: 'Minecraft', defaultPort: 25565 },
  { id: 'rust', name: 'Rust', defaultPort: 28015 },
  { id: 'csgo', name: 'CS:GO', defaultPort: 27015 },
  { id: 'ark', name: 'ARK: Survival Evolved', defaultPort: 7777 },
  { id: 'valheim', name: 'Valheim', defaultPort: 2456 },
  { id: 'terraria', name: 'Terraria', defaultPort: 7777 },
  { id: 'seven_days', name: '7 Days to Die', defaultPort: 26900 },
  { id: 'unturned', name: 'Unturned', defaultPort: 27015 },
]

const defaultFormData: CreateServerRequest = {
  node_id: '',
  game_type: '',
  config: {
    name: '',
    version: 'latest',
    max_players: 20,
    settings: {}
  },
  requirements: {
    min_cpu_cores: 1,
    min_memory_mb: 2048,
    min_storage_mb: 10240
  }
}

export const ServerModal: React.FC<ServerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  nodes,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateServerRequest>(defaultFormData)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setFormData(defaultFormData)
      setStep(1)
    }
  }, [isOpen])

  const handleNodeSelect = (nodeId: string) => {
    setFormData(prev => ({
      ...prev,
      node_id: nodeId
    }))
  }

  const handleGameTypeSelect = (gameType: string) => {
    setFormData(prev => ({
      ...prev,
      game_type: gameType
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('config.')) {
      const configField = name.replace('config.', '')
      setFormData(prev => ({
        ...prev,
        config: {
          ...prev.config,
          [configField]: configField === 'max_players' ? parseInt(value) || 0 : value
        }
      }))
    } else if (name.startsWith('requirements.')) {
      const reqField = name.replace('requirements.', '')
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [reqField]: parseInt(value) || 0
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const canProceedToStep2 = formData.node_id !== ''
  const canProceedToStep3 = formData.game_type !== ''
  const canSubmit = formData.config.name !== '' && formData.config.version !== ''

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-dark-700 border border-dark-400 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-400">
          <h2 className="text-xl font-semibold text-white">Create New Server</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 p-4 border-b border-dark-400">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s 
                    ? 'bg-neon-cyan text-dark-900' 
                    : 'bg-dark-500 text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 rounded ${step > s ? 'bg-neon-cyan' : 'bg-dark-500'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Step 1: Select Node */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Select a Node</h3>
              <p className="text-gray-400 text-sm">Choose the node where you want to deploy your server.</p>
              
              {nodes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                  <p className="text-gray-400">No nodes available</p>
                  <p className="text-gray-500 text-sm mt-1">Add a node first before creating a server</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nodes.filter(n => n.status === 'online').map(node => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => handleNodeSelect(node.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.node_id === node.id
                          ? 'border-neon-cyan bg-neon-cyan/10'
                          : 'border-dark-400 bg-dark-600 hover:border-dark-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">{node.name}</div>
                          <div className="text-gray-500 text-sm">{node.game_type}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2 text-xs text-gray-400">
                        <span>Port: {node.port}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Game Type */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Select Game Type</h3>
              <p className="text-gray-400 text-sm">Choose the type of game server you want to create.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableGameTypes.map(game => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleGameTypeSelect(game.id)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      formData.game_type === game.id
                        ? 'border-neon-cyan bg-neon-cyan/10'
                        : 'border-dark-400 bg-dark-600 hover:border-dark-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🎮</div>
                    <div className="text-white font-medium text-sm">{game.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Configure Server */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Configure Server</h3>
              <p className="text-gray-400 text-sm">Set up your server configuration.</p>
              
              {/* Server Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Server Name *
                </label>
                <input
                  type="text"
                  name="config.name"
                  value={formData.config.name}
                  onChange={handleChange}
                  required
                  className="input w-full"
                  placeholder="e.g., My Awesome Server"
                />
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  name="config.version"
                  value={formData.config.version}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="e.g., 1.20.4, latest"
                />
              </div>

              {/* Max Players */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Players
                </label>
                <input
                  type="number"
                  name="config.max_players"
                  value={formData.config.max_players}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="input w-full"
                />
              </div>

              {/* Resource Requirements */}
              <div className="border-t border-dark-400 pt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Resource Requirements</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">CPU Cores</label>
                    <input
                      type="number"
                      name="requirements.min_cpu_cores"
                      value={formData.requirements.min_cpu_cores}
                      onChange={handleChange}
                      min="1"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Memory (MB)</label>
                    <input
                      type="number"
                      name="requirements.min_memory_mb"
                      value={formData.requirements.min_memory_mb}
                      onChange={handleChange}
                      min="256"
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Storage (MB)</label>
                    <input
                      type="number"
                      name="requirements.min_storage_mb"
                      value={formData.requirements.min_storage_mb}
                      onChange={handleChange}
                      min="1024"
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4 border-t border-dark-400">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Back
              </button>
            )}
            
            <div className="flex-1" />
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn btn-primary"
                disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3)}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading || !canSubmit}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="spinner w-4 h-4" />
                    Creating...
                  </span>
                ) : (
                  'Create Server'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ServerModal
