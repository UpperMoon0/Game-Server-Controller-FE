import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Server, ServerMetrics } from '../../types/api'
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
  addServer: (server: Server) => void
  updateServer: (server: Server) => void
  removeServer: (serverId: string) => void
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

        addServer: (server: Server) => {
          set((state) => ({
            servers: [...state.servers, server]
          }))
        },

        updateServer: (server: Server) => {
          set((state) => ({
            servers: state.servers.map((s) => (s.id === server.id ? server : s))
          }))
        },

        removeServer: (serverId: string) => {
          set((state) => ({
            servers: state.servers.filter((s) => s.id !== serverId),
            selectedServerId: state.selectedServerId === serverId ? null : state.selectedServerId
          }))
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
