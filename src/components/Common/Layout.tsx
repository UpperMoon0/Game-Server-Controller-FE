import React, { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import { useServersStore } from '../../store/servers/serversSlice'

export const Layout: React.FC = () => {
  const { fetchNodes } = useNodesStore()
  const { fetchServers } = useServersStore()

  useEffect(() => {
    fetchNodes()
    fetchServers()
  }, [fetchNodes, fetchServers])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Game Server Controller</h1>
        </div>
        <nav className="mt-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/nodes"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            Nodes
          </NavLink>
          <NavLink
            to="/servers"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            Servers
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
            }
          >
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
