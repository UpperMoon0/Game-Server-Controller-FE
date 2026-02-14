import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Common/Layout'
import { Dashboard } from './components/Dashboard/Dashboard'
import { NodeList } from './components/NodeManager/NodeList'
import { ServerList } from './components/ServerManager/ServerList'
import { Settings } from './components/Settings/Settings'
import { useSettingsStore } from './store/settings/settingsStore'
import { setApiBaseUrl } from './services/api'

function App() {
  const { settings, fetchSettings } = useSettingsStore()

  useEffect(() => {
    // Load settings on app start
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    // Update API base URL when settings change
    if (settings.api_url) {
      setApiBaseUrl(settings.api_url)
    }
  }, [settings.api_url])

  return (
    <BrowserRouter>
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
