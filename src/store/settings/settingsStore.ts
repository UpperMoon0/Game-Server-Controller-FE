import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/tauri'

export interface AppSettings {
  api_url: string
  refresh_interval: number
  notifications: boolean
  dark_mode: boolean
}

const defaultSettings: AppSettings = {
  api_url: 'http://localhost:8080',
  refresh_interval: 30,
  notifications: true,
  dark_mode: true,
}

interface SettingsState {
  settings: AppSettings
  loading: boolean
  initialized: boolean
  error: string | null
  saved: boolean
  fetchSettings: () => Promise<void>
  saveSettings: (settings: AppSettings) => Promise<void>
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => Promise<void>
  clearSaved: () => void
  clearError: () => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings,
  loading: false,
  initialized: false,
  error: null,
  saved: false,

  fetchSettings: async () => {
    set({ loading: true, error: null })
    try {
      const settings = await invoke<AppSettings>('get_settings')
      set({ settings, loading: false, initialized: true })
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      set({ 
        loading: false, 
        initialized: true,
        error: String(error),
        settings: defaultSettings 
      })
    }
  },

  saveSettings: async (settings: AppSettings) => {
    set({ loading: true, error: null })
    try {
      await invoke('save_settings_cmd', { settings })
      set({ settings, loading: false, saved: true })
    } catch (error) {
      set({ loading: false, error: String(error) })
    }
  },

  updateSetting: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
      saved: false,
    }))
  },

  resetSettings: async () => {
    set({ loading: true, error: null })
    try {
      const settings = await invoke<AppSettings>('reset_settings_cmd')
      set({ settings, loading: false, saved: true })
    } catch (error) {
      set({ loading: false, error: String(error) })
    }
  },

  clearSaved: () => set({ saved: false }),
  clearError: () => set({ error: null }),
}))
