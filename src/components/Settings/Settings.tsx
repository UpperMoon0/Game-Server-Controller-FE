import React, { useEffect } from 'react'
import { useSettingsStore } from '../../store/settings/settingsStore'
import { setApiBaseUrl } from '../../services/api'

export const Settings: React.FC = () => {
  const { 
    settings, 
    loading, 
    error, 
    saved, 
    fetchSettings, 
    saveSettings, 
    updateSetting, 
    resetSettings,
    clearSaved 
  } = useSettingsStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => clearSaved(), 3000)
      return () => clearTimeout(timer)
    }
  }, [saved, clearSaved])

  const handleSave = () => {
    saveSettings(settings)
    // Update API base URL immediately after save
    setApiBaseUrl(settings.api_url)
  }

  const handleReset = () => {
    resetSettings()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your application preferences</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card max-w-2xl border-neon-red/30 bg-neon-red/10">
          <p className="text-neon-red">{error}</p>
        </div>
      )}

      {/* General Settings */}
      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-neon-cyan rounded-full" />
          General Settings
        </h2>
        
        <div className="space-y-6">
          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <input
                type="text"
                value={settings.api_url}
                onChange={(e) => updateSetting('api_url', e.target.value)}
                className="input w-full pl-10"
                placeholder="http://localhost:8080"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">The base URL for the API server</p>
          </div>

          {/* Refresh Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refresh Interval
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                type="number"
                value={settings.refresh_interval}
                onChange={(e) => updateSetting('refresh_interval', parseInt(e.target.value) || 30)}
                className="input w-full pl-10"
                min="5"
                max="300"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">seconds</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">How often to refresh data (5-300 seconds)</p>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-dark-600 rounded-lg border border-dark-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-neon-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Enable notifications</p>
                <p className="text-sm text-gray-500">Receive alerts for important events</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                settings.notifications ? 'bg-neon-cyan/30' : 'bg-dark-400'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
                  settings.notifications 
                    ? 'left-8 bg-neon-cyan shadow-neon-cyan' 
                    : 'left-1 bg-gray-400'
                }`}
              />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-dark-600 rounded-lg border border-dark-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Dark mode</p>
                <p className="text-sm text-gray-500">Use dark theme for the interface</p>
              </div>
            </div>
            <button
              onClick={() => updateSetting('dark_mode', !settings.dark_mode)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                settings.dark_mode ? 'bg-neon-pink/30' : 'bg-dark-400'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 ${
                  settings.dark_mode 
                    ? 'left-8 bg-neon-pink shadow-neon-pink' 
                    : 'left-1 bg-gray-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-dark-400 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Save Settings
          </button>
          
          {saved && (
            <div className="flex items-center gap-2 text-neon-green animate-pulse">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Settings saved!</span>
            </div>
          )}
        </div>
      </div>

      {/* About Section */}
      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-neon-purple rounded-full" />
          About
        </h2>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <svg className="w-8 h-8 text-dark-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Game Server Controller UI</h3>
            <p className="text-gray-400 text-sm mb-3">Version 1.0.0</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-dark-500 text-neon-cyan text-xs rounded">React</span>
              <span className="px-2 py-1 bg-dark-500 text-neon-purple text-xs rounded">TypeScript</span>
              <span className="px-2 py-1 bg-dark-500 text-neon-pink text-xs rounded">Tauri</span>
              <span className="px-2 py-1 bg-dark-500 text-neon-green text-xs rounded">Tailwind CSS</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-dark-400">
          <p className="text-gray-400 text-sm">
            A modern game server management interface with real-time monitoring, 
            node management, and server lifecycle control.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card max-w-2xl border-neon-red/30">
        <h2 className="text-lg font-semibold text-neon-red mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger Zone
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-dark-600 rounded-lg border border-neon-red/20">
          <div>
            <p className="text-white font-medium">Reset all settings</p>
            <p className="text-sm text-gray-500">This will reset all settings to their default values</p>
          </div>
          <button 
            onClick={handleReset}
            disabled={loading}
            className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
