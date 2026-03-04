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
} from 'lucide-react'

const NAV_PRIMARY = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
]

const NAV_WHATSAPP = [
  { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp', highlight: true },
]

const NAV_MANAGEMENT = [
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/cases', icon: FolderOpen, label: 'Expedientes' },
  { to: '/messages', icon: MessageSquare, label: 'Mensajes' },
  { to: '/appointments', icon: Calendar, label: 'Citas' },
  { to: '/documents', icon: FileText, label: 'Documentos' },
  { to: '/knowledge', icon: BookOpen, label: 'Base Legal' },
  { to: '/analytics', icon: BarChart3, label: 'Analíticas' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-150 ${
          isActive
            ? 'bg-[#2D3FA0] text-white shadow-[0_2px_12px_rgba(59,130,246,0.35)]'
            : item.highlight
            ? 'text-indigo-300 hover:bg-[#1a2460]/60 hover:text-white'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            size={17}
            className={`flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}
          />
          <span className="truncate">{item.label}</span>
          {item.highlight && !isActive && (
            <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400 shadow-[0_0_5px_rgba(99,102,241,0.9)]" />
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const closeMenu = () => setSidebarOpen(false)

  return (
    <div className="flex min-h-screen min-w-0" style={{ background: '#06060b' }}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[200px] flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#06060b', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-0 leading-none">
            <span className="text-[18px] font-extrabold text-white tracking-tight">Gurú</span>
            <span
              className="text-[18px] font-extrabold tracking-tight"
              style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Legal
            </span>
          </div>
          <button onClick={closeMenu} className="rounded p-1 text-slate-600 hover:text-white md:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {/* Main */}
          <div className="space-y-0.5">
            {NAV_PRIMARY.map(item => (
              <NavItem key={item.to} item={item} onClick={closeMenu} />
            ))}
          </div>

          {/* WhatsApp Bot */}
          <div className="mt-4">
            <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">
              WhatsApp Bot
            </p>
            <div className="space-y-0.5">
              {NAV_WHATSAPP.map(item => (
                <NavItem key={item.to} item={item} onClick={closeMenu} />
              ))}
            </div>
          </div>

          {/* Gestión */}
          <div className="mt-4">
            <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">
              Gestión
            </p>
            <div className="space-y-0.5">
              {NAV_MANAGEMENT.map(item => (
                <NavItem key={item.to} item={item} onClick={closeMenu} />
              ))}
            </div>
          </div>
        </nav>

        {/* User */}
        <div className="border-t px-3 py-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {(user?.name || user?.email || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-slate-200">{user?.name || 'Admin'}</p>
              <p className="truncate text-[10px] text-slate-500">{user?.email?.split('@')[0]}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-medium text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <LogOut size={12} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header
          className="flex items-center gap-4 px-6 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#06060b' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded p-1.5 text-slate-500 hover:text-white md:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <div className="hidden items-center gap-2 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-[12px] text-slate-500 uppercase tracking-widest">Sesión activa:</span>
            <span className="text-[12px] font-bold text-slate-200 uppercase tracking-wider">
              {user?.name || user?.email?.split('@')[0] || 'Admin'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main
          className="min-w-0 flex-1 overflow-y-auto p-6 lg:p-8"
          style={{
            background: '#06060b',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
