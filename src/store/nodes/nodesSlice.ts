import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Node, NodeMetrics, CreateNodeRequest } from '../../types/api'
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
  createNode: (data: CreateNodeRequest) => Promise<Node | null>
  updateNodeData: (id: string, data: Partial<Node>) => Promise<Node | null>
  deleteNode: (nodeId: string) => Promise<boolean>
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

        createNode: async (data: CreateNodeRequest) => {
          set({ loading: true, error: null })
          try {
            const node = await nodesApi.create(data)
            set((state) => ({
              nodes: [...state.nodes, node],
              loading: false
            }))
            return node
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to create node' 
            })
            return null
          }
        },

        updateNodeData: async (id: string, data: Partial<Node>) => {
          set({ loading: true, error: null })
          try {
            const node = await nodesApi.update(id, data)
            set((state) => ({
              nodes: state.nodes.map((n) => (n.id === id ? node : n)),
              loading: false
            }))
            return node
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to update node' 
            })
            return null
          }
        },

        deleteNode: async (nodeId: string) => {
          set({ loading: true, error: null })
          try {
            await nodesApi.delete(nodeId)
            set((state) => ({
              nodes: state.nodes.filter((n) => n.id !== nodeId),
              selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
              loading: false
            }))
            return true
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to delete node' 
            })
            return false
          }
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
