import React, { useState } from 'react'

export const Settings: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:8080')
  const [refreshInterval, setRefreshInterval] = useState(30)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleSave = () => {
    // TODO: Save settings
    console.log('Settings saved')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="http://localhost:8080"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refresh Interval (seconds)
            </label>
            <input
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
              min="5"
              max="300"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="mr-2"
              id="notifications"
            />
            <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
              Enable notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="mr-2"
              id="darkMode"
            />
            <label htmlFor="darkMode" className="text-sm font-medium text-gray-700">
              Dark mode
            </label>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mt-6">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="text-sm text-gray-600">
          <p>Game Server Controller UI v1.0.0</p>
          <p className="mt-2">Built with React, TypeScript, and Tauri</p>
        </div>
      </div>
    </div>
  )
}
