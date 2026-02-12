import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Common/Layout'
import { Dashboard } from './components/Dashboard/Dashboard'
import { NodeList } from './components/NodeManager/NodeList'
import { ServerList } from './components/ServerManager/ServerList'
import { Settings } from './components/Settings/Settings'

function App() {
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
