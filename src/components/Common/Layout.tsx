import React, { useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useNodesStore } from '../../store/nodes/nodesSlice'

export const Layout: React.FC = () => {
  const { fetchNodes } = useNodesStore()

  useEffect(() => {
    fetchNodes()
  }, [fetchNodes])

  return (
    <div className="flex h-screen bg-dark-900">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-800 border-r border-dark-500 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-dark-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
              <svg className="w-6 h-6 text-dark-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white neon-text-subtle">Game Server</h1>
              <p className="text-xs text-neon-cyan">Controller</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-dark-600 text-neon-cyan border border-neon-cyan/30 shadow-neon-cyan'
                  : 'text-gray-400 hover:bg-dark-600 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg className={`w-5 h-5 ${isActive ? 'text-neon-cyan' : 'group-hover:text-neon-cyan'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/nodes"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-dark-600 text-neon-purple border border-neon-purple/30 shadow-neon-purple'
                  : 'text-gray-400 hover:bg-dark-600 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg className={`w-5 h-5 ${isActive ? 'text-neon-purple' : 'group-hover:text-neon-purple'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span className="font-medium">Nodes</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                isActive
                  ? 'bg-dark-600 text-neon-pink border border-neon-pink/30 shadow-neon-pink'
                  : 'text-gray-400 hover:bg-dark-600 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <svg className={`w-5 h-5 ${isActive ? 'text-neon-pink' : 'group-hover:text-neon-pink'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Settings</span>
              </>
            )}
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-500">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-sm text-gray-400">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-dark-900">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
