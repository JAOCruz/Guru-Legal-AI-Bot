import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { api } from '../utils/api'
import { formatDateTime, DOC_STATUS_MAP } from '../utils/format'
import { FileText, Eye, Download, Send, Pencil, Upload, CheckCircle, XCircle, RotateCcw } from 'lucide-react'

// ── Helper: which docs need attention right now ──
function isPending(status) {
  return status === 'pdf_listo' || status === 'en_revision'
}

// ── PDF Viewer modal ──
function PdfModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative h-full max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-slate-900 shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <span className="font-semibold text-white">Vista previa del documento</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>
        <iframe
          src={url}
          className="h-[calc(90vh-52px)] w-full"
          title="Vista previa PDF"
        />
      </div>
    </div>
  )
}

// ── Modify modal: choose digital edit or upload ──
function ModifyModal({ doc, onClose, onReload }) {
  const [mode, setMode] = useState(null) // 'upload' | null
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleUpload() {
    if (!file) return
    setSaving(true)
    try {
      const form = new FormData()
      form.append('pdf', file)
      form.append('version', 'modified')
      await api.upload(`/dashboard/documents/${doc.id}/pdf`, form)
      onReload()
      onClose()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-bold text-white">Modificar documento</h3>
        <p className="mb-5 text-sm text-slate-400">DOC-{doc.id} · {doc.doc_type}</p>

        {!mode && (
          <div className="space-y-3">
            <button
              className="flex w-full items-center gap-3 rounded-lg border border-slate-700 p-4 text-left transition hover:border-yellow-500 hover:bg-slate-800"
              onClick={() => { window.open(doc.pdf_url, '_blank'); onClose() }}
            >
              <Download size={20} className="shrink-0 text-yellow-400" />
              <div>
                <div className="font-semibold text-white">Descargar → editar → subir</div>
                <div className="text-xs text-slate-400">Descarga el PDF, edítalo manualmente y sube la nueva versión</div>
              </div>
            </button>

            <button
              className="flex w-full items-center gap-3 rounded-lg border border-slate-700 p-4 text-left transition hover:border-blue-500 hover:bg-slate-800"
              onClick={() => setMode('upload')}
            >
              <Upload size={20} className="shrink-0 text-blue-400" />
              <div>
                <div className="font-semibold text-white">Subir versión nueva</div>
                <div className="text-xs text-slate-400">Ya tienes el PDF corregido — súbelo aquí directamente</div>
              </div>
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-4">
            <label
              className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-600 p-8 transition hover:border-blue-500"
              htmlFor="pdf-upload"
            >
              <Upload size={28} className="text-slate-400" />
              <span className="text-sm text-slate-400">
                {file ? file.name : 'Haz clic o arrastra el PDF aquí'}
              </span>
            </label>
            <input id="pdf-upload" type="file" accept=".pdf" className="hidden"
              onChange={e => setFile(e.target.files[0])} />

            <div className="flex gap-3">
              <button className="btn btn-sm" onClick={() => setMode(null)}>← Atrás</button>
              <button
                className="btn btn-sm btn-primary flex-1"
                disabled={!file || saving}
                onClick={handleUpload}
              >
                {saving ? 'Subiendo...' : 'Subir y reemplazar'}
              </button>
            </div>
          </div>
        )}

        {!mode && (
          <button className="mt-4 w-full text-sm text-slate-500 hover:text-slate-300" onClick={onClose}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Document card (pending) ──
function DocCard({ doc, onReload }) {
  const [preview, setPreview] = useState(false)
  const [modifying, setModifying] = useState(false)
  const [sending, setSending] = useState(false)

  const hasPdf = !!doc.pdf_url

  async function sendToClient() {
    if (!window.confirm(`¿Enviar este PDF al cliente ${doc.client_name || '#' + doc.client_id} por WhatsApp?`)) return
    setSending(true)
    try {
      await api.post(`/dashboard/documents/${doc.id}/send`)
      onReload()
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  async function approve() {
    try {
      await api.put(`/dashboard/documents/${doc.id}`, { status: 'aprobado' })
      onReload()
    } catch (err) {
      alert(err.message)
    }
  }

  async function reject() {
    const reason = window.prompt('Motivo de rechazo (opcional):')
    if (reason === null) return
    try {
      await api.put(`/dashboard/documents/${doc.id}`, {
        status: 'rechazado',
        notes: reason || 'Rechazado por el equipo legal'
      })
      onReload()
    } catch (err) {
      alert(err.message)
    }
  }

  const statusInfo = DOC_STATUS_MAP[doc.status] || { label: doc.status, cls: 'badge-muted' }

  return (
    <>
      {preview && hasPdf && <PdfModal url={doc.pdf_url} onClose={() => setPreview(false)} />}
      {modifying && <ModifyModal doc={doc} onClose={() => setModifying(false)} onReload={onReload} />}

      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5 transition hover:border-slate-600">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
            <FileText size={20} className="text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-white">DOC-{doc.id}</span>
              <span className={`badge ${statusInfo.cls} text-xs`}>{statusInfo.label}</span>
              {isPending(doc.status) && (
                <span className="animate-pulse rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                  Requiere revisión
                </span>
              )}
            </div>
            <div className="mt-0.5 text-sm text-slate-400">
              {doc.doc_type} · {doc.client_name || `Cliente #${doc.client_id}`}
            </div>
          </div>
          <div className="text-xs text-slate-500">{formatDateTime(doc.created_at)}</div>
        </div>

        {doc.description && (
          <p className="mb-4 text-sm text-slate-400">{doc.description}</p>
        )}

        {/* PDF actions */}
        {hasPdf ? (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className="btn btn-sm flex items-center gap-1.5"
              onClick={() => setPreview(true)}
            >
              <Eye size={14} /> Ver PDF
            </button>
            <a
              href={doc.pdf_url}
              download
              className="btn btn-sm flex items-center gap-1.5"
            >
              <Download size={14} /> Descargar
            </a>
          </div>
        ) : (
          <p className="mb-4 text-xs text-slate-500 italic">PDF no generado aún</p>
        )}

        {/* Decision row */}
        <div className="flex flex-wrap gap-2 border-t border-slate-700 pt-4">
          {hasPdf && (doc.status === 'pdf_listo' || doc.status === 'en_revision' || doc.status === 'aprobado') && (
            <button
              className="btn btn-sm btn-primary flex items-center gap-1.5"
              onClick={sendToClient}
              disabled={sending}
            >
              <Send size={14} /> {sending ? 'Enviando...' : 'Enviar al cliente'}
            </button>
          )}

          {hasPdf && (doc.status === 'pdf_listo' || doc.status === 'en_revision') && (
            <button
              className="btn btn-sm flex items-center gap-1.5 border border-slate-600 hover:border-blue-500 hover:text-blue-400"
              onClick={() => setModifying(true)}
            >
              <Pencil size={14} /> Modificar
            </button>
          )}

          {(doc.status === 'pdf_listo' || doc.status === 'en_revision') && (
            <button
              className="btn btn-sm flex items-center gap-1.5 border border-slate-600 hover:border-emerald-500 hover:text-emerald-400"
              onClick={approve}
            >
              <CheckCircle size={14} /> Aprobar
            </button>
          )}

          {doc.status !== 'rechazado' && doc.status !== 'completado' && doc.status !== 'enviado_cliente' && (
            <button
              className="btn btn-sm flex items-center gap-1.5 border border-slate-600 hover:border-red-500 hover:text-red-400"
              onClick={reject}
            >
              <XCircle size={14} /> Rechazar
            </button>
          )}
        </div>
      </div>
    </>
  )
}

// ── Main page ──
export default function Documents() {
  const { data, loading, reload } = useApi('/dashboard/documents')
  const [tab, setTab] = useState('pending') // 'pending' | 'all'

  const docs = data?.documents || []
  const pending = docs.filter(d => isPending(d.status))
  const shown = tab === 'pending' ? pending : docs

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Documentos</h2>
          <p className="mt-1 text-sm text-slate-400">Revisa, aprueba y envía los PDFs generados por el bot</p>
        </div>

        {pending.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
            {pending.length} documento{pending.length !== 1 ? 's' : ''} pendiente{pending.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setTab('pending')}
        >
          Pendientes {pending.length > 0 && <span className="ml-1 rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs text-black">{pending.length}</span>}
        </button>
        <button
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setTab('all')}
        >
          Todos ({docs.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-slate-400">Cargando...</p>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-600" />
          <p className="text-slate-400">
            {tab === 'pending' ? 'No hay documentos pendientes de revisión' : 'No hay documentos aún'}
          </p>
        </div>
      ) : tab === 'pending' ? (
        // Card view for pending
        <div className="space-y-4">
          {shown.map(d => (
            <DocCard key={d.id} doc={d} onReload={reload} />
          ))}
        </div>
      ) : (
        // Table view for all
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ref.</th><th>Tipo</th><th>Cliente</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shown.map(d => {
                  const s = DOC_STATUS_MAP[d.status] || { label: d.status, cls: 'badge-muted' }
                  return (
                    <tr key={d.id}>
                      <td><strong>DOC-{d.id}</strong></td>
                      <td>{d.doc_type}</td>
                      <td>{d.client_name || `#${d.client_id}`}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td className="text-sm text-slate-400">{formatDateTime(d.created_at)}</td>
                      <td>
                        {d.pdf_url && (
                          <a href={d.pdf_url} download className="btn btn-sm flex items-center gap-1">
                            <Download size={12} /> PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
