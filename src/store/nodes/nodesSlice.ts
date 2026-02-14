import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Node, NodeMetrics } from '../../types/api'
import { nodesApi } from '../../services/api'

interface NodesState {
  nodes: Node[]
  selectedNodeId: string | null
  metrics: Record<string, NodeMetrics>
  loading: boolean
  error: string | null
  
  // Actions
  fetchNodes: () => Promise<void>
  fetchNodeMetrics: (nodeId: string) => Promise<void>
  selectNode: (nodeId: string | null) => void
  addNode: (node: Node) => void
  updateNode: (node: Node) => void
  removeNode: (nodeId: string) => void
  clearError: () => void
}

export const useNodesStore = create<NodesState>()(
  devtools(
    persist(
      (set) => ({
        nodes: [],
        selectedNodeId: null,
        metrics: {},
        loading: false,
        error: null,

        fetchNodes: async () => {
          set({ loading: true, error: null })
          try {
            const nodes = await nodesApi.getAll()
            set({ nodes, loading: false })
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch nodes' 
            })
          }
        },

        fetchNodeMetrics: async (nodeId: string) => {
          try {
            const metrics = await nodesApi.getMetrics(nodeId)
            set((state) => ({
              metrics: { ...state.metrics, [nodeId]: metrics }
            }))
          } catch (error) {
            console.error('Failed to fetch metrics:', error)
          }
        },

        selectNode: (nodeId: string | null) => {
          set({ selectedNodeId: nodeId })
        },

        addNode: (node: Node) => {
          set((state) => ({
            nodes: [...state.nodes, node]
          }))
        },

        updateNode: (node: Node) => {
          set((state) => ({
            nodes: state.nodes.map((n) => (n.id === node.id ? node : n))
          }))
        },

        removeNode: (nodeId: string) => {
          set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== nodeId),
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
          }))
        },

        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'nodes-storage',
        partialize: (state) => ({ selectedNodeId: state.selectedNodeId })
      }
    )
  )
)
