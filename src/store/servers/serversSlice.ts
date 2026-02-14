import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Server, ServerMetrics, CreateServerRequest, CreateServerResponse } from '../../types/api'
import { serversApi } from '../../services/api'

interface ServersState {
  servers: Server[]
  selectedServerId: string | null
  metrics: Record<string, ServerMetrics>
  logs: Record<string, string[]>
  loading: boolean
  error: string | null
  
  // Actions
  fetchServers: (filters?: Record<string, string>) => Promise<void>
  fetchServerMetrics: (serverId: string) => Promise<void>
  fetchServerLogs: (serverId: string, tail?: number) => Promise<void>
  selectServer: (serverId: string | null) => void
  createServer: (data: CreateServerRequest) => Promise<CreateServerResponse | null>
  updateServerData: (id: string, data: Partial<Server>) => Promise<Server | null>
  deleteServer: (serverId: string, backup?: boolean) => Promise<boolean>
  serverAction: (serverId: string, action: string) => Promise<boolean>
  clearError: () => void
}

export const useServersStore = create<ServersState>()(
  devtools(
    persist(
      (set) => ({
        servers: [],
        selectedServerId: null,
        metrics: {},
        logs: {},
        loading: false,
        error: null,

        fetchServers: async (filters?: Record<string, string>) => {
          set({ loading: true, error: null })
          try {
            const servers = await serversApi.getAll(filters)
            set({ servers, loading: false })
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to fetch servers' 
            })
          }
        },

        fetchServerMetrics: async (serverId: string) => {
          try {
            const metrics = await serversApi.getMetrics(serverId)
            set((state) => ({
              metrics: { ...state.metrics, [serverId]: metrics }
            }))
          } catch (error) {
            console.error('Failed to fetch server metrics:', error)
          }
        },

        fetchServerLogs: async (serverId: string, tail?: number) => {
          try {
            const logs = await serversApi.getLogs(serverId, tail)
            set((state) => ({
              logs: { ...state.logs, [serverId]: logs }
            }))
          } catch (error) {
            console.error('Failed to fetch server logs:', error)
          }
        },

        selectServer: (serverId: string | null) => {
          set({ selectedServerId: serverId })
        },

        createServer: async (data: CreateServerRequest) => {
          set({ loading: true, error: null })
          try {
            const response = await serversApi.create(data)
            // Refresh the server list after creation
            const servers = await serversApi.getAll()
            set({ servers, loading: false })
            return response
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to create server' 
            })
            return null
          }
        },

        updateServerData: async (id: string, data: Partial<Server>) => {
          set({ loading: true, error: null })
          try {
            const server = await serversApi.update(id, data)
            set((state) => ({
              servers: state.servers.map((s) => (s.id === id ? server : s)),
              loading: false
            }))
            return server
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to update server' 
            })
            return null
          }
        },

        deleteServer: async (serverId: string, backup?: boolean) => {
          set({ loading: true, error: null })
          try {
            await serversApi.delete(serverId, backup)
            set((state) => ({
              servers: state.servers.filter((s) => s.id !== serverId),
              selectedServerId: state.selectedServerId === serverId ? null : state.selectedServerId,
              loading: false
            }))
            return true
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : 'Failed to delete server' 
            })
            return false
          }
        },

        serverAction: async (serverId: string, action: string) => {
          set({ loading: true, error: null })
          try {
            await serversApi.action(serverId, action)
            // Refresh the server list after action
            const servers = await serversApi.getAll()
            set({ servers, loading: false })
            return true
          } catch (error) {
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : `Failed to ${action} server` 
            })
            return false
          }
        },

        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'servers-storage',
        partialize: (state) => ({ selectedServerId: state.selectedServerId })
      }
    )
  )
)
