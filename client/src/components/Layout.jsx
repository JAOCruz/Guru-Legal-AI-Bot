import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageSquare,
  Calendar,
  FileText,
  BookOpen,
  MessageCircle,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Scale
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/cases', icon: FolderOpen, label: 'Expedientes' },
  { to: '/messages', icon: MessageSquare, label: 'Mensajes' },
  { to: '/appointments', icon: Calendar, label: 'Citas' },
  { to: '/documents', icon: FileText, label: 'Documentos' },
  { to: '/knowledge', icon: BookOpen, label: 'Base Legal' },
  { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { to: '/analytics', icon: BarChart3, label: 'Analíticas' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-[#0F172A]">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-700 bg-slate-900 transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex min-w-0 items-center justify-between gap-2 border-b border-slate-700 p-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Scale className="h-6 w-6 flex-shrink-0 text-purple-400" />
            <span className="truncate text-lg font-bold text-white">
              Guru Legal
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `group flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-purple-400' : ''
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="min-w-0 border-t border-slate-700 p-4">
          <div className="mb-2 min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || 'Usuario'}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex min-w-0 items-center gap-4 border-b border-slate-700 bg-slate-900/50 px-4 py-3 backdrop-blur-sm md:px-6">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Email (Desktop Only) */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-slate-400">{user?.email}</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
