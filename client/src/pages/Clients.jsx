import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { api } from '../utils/api'
import { formatDate } from '../utils/format'

export default function Clients() {
  const { data, loading, reload } = useApi('/clients')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const clients = (data?.clients || []).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  function openEdit(client) {
    setForm(client ? { ...client } : { name: '', phone: '', email: '', address: '', notes: '' })
    setEditing(client ? client.id : 'new')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        await api.post('/clients', form)
      } else {
        await api.put(`/clients/${editing}`, form)
      }
      setEditing(null)
      reload()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este cliente?')) return
    await api.del(`/clients/${id}`)
    reload()
  }

  return (
    <div>
      <div className="flex-between mb-md">
        <h2>Clientes</h2>
        <button className="btn btn-primary" onClick={() => openEdit(null)}>+ Nuevo Cliente</button>
      </div>

      <div className="card">
        <input className="input mb-md" placeholder="Buscar por nombre o teléfono..." value={search} onChange={e => setSearch(e.target.value)} />

        {loading ? <p className="text-muted">Cargando...</p> : clients.length === 0 ? <p className="empty">No se encontraron clientes</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th className="hide-mobile">Registrado</th><th>Acciones</th></tr></thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.phone}</td>
                    <td className="text-sm">{c.email || '—'}</td>
                    <td className="text-sm text-muted hide-mobile">{formatDate(c.created_at)}</td>
                    <td>
                      <div className="flex gap-sm">
                        <Link to={`/messages/${c.id}`} className="btn btn-secondary btn-sm">💬</Link>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing !== null && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing === 'new' ? 'Nuevo Cliente' : 'Editar Cliente'}</h3>
            <form onSubmit={handleSave}>
              <div className="mb-sm"><label className="label">Nombre *</label><input className="input" required value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="mb-sm"><label className="label">Teléfono *</label><input className="input" required value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="mb-sm"><label className="label">Correo</label><input className="input" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="mb-sm"><label className="label">Domicilio</label><input className="input" value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              <div className="mb-md"><label className="label">Notas</label><textarea className="input" rows="3" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="flex gap-sm" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
