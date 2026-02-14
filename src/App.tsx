import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Common/Layout'
import { Dashboard } from './components/Dashboard/Dashboard'
import { NodeList } from './components/NodeManager/NodeList'
import { ServerList } from './components/ServerManager/ServerList'
import { Settings } from './components/Settings/Settings'
import { useSettingsStore } from './store/settings/settingsStore'

function App() {
  const { fetchSettings, initialized } = useSettingsStore()
  const hasFetched = useRef(false)

  useEffect(() => {
    // Only fetch settings once on mount
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchSettings()
    }
  }, [fetchSettings])

  // Wait for settings to be initialized before rendering routes
  // This ensures the API URL is set in the Rust backend before any API calls are made
  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="nodes" element={<NodeList />} />
          <Route path="servers" element={<ServerList />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
