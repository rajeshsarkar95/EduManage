'use client'
import { useState, useEffect, ChangeEvent } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus,Search,X,BookOpen,Loader2,AlertCircle,RefreshCw} from 'lucide-react';
const API_BASE = 'https://edumanagebackend-1.onrender.com/api/v1/library';

interface BookApiResponse {
  _id:string
  title:string
  author:string
  category:string
  totalCopies:number
  available:number
  isbn:string
  createdAt:string
  updatedAt:string
  __v:number
}
interface Book extends BookApiResponse {
  id: string
  total: number
}
interface ApiEnvelope<T>{
  success:boolean
  data:T
  message?:string
}
interface BookForm {
  title: string
  author: string
  category: string
  available: number
  totalCopies: number
  isbn: string
}
type BookCategory = 'Textbook' | 'Fiction' | 'Non-Fiction' | 'Reference' | 'Autobiography' | 'Science'
const CATEGORIES: BookCategory[] = [
  'Textbook', 'Fiction', 'Non-Fiction', 'Reference', 'Autobiography', 'Science',
]

const INITIAL_FORM:BookForm = {
  title:'',
  author:'',
  category:'Textbook',
  available:1,
  totalCopies:1,
  isbn:'',
}

function normaliseBook(raw:BookApiResponse):Book{
  return {
    ...raw,
    id: raw._id,
    total: raw.totalCopies ?? 1,
  }
}

export default function LibraryPage(){
  const [books,setBooks] = useState<Book[]>([])
  const [loading,setLoading] = useState<boolean>(true)
  const [error,setError] = useState<string | null>(null)
  const [search,setSearch] = useState<string>('')
  const [modal,setModal] = useState<boolean>(false)
  const [submitting,setSubmitting] = useState<boolean>(false)
  const [form,setForm] = useState<BookForm>(INITIAL_FORM)

  const fetchBooks = async (): Promise<void>=>{
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_BASE)
      const json: ApiEnvelope<BookApiResponse[]> = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Failed to fetch books')
      setBooks((json.data ?? []).map(normaliseBook))
    } catch (err){
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchBooks()
  }, [])
  const handleAdd = async (): Promise<void> => {
    if (!form.title.trim() || !form.author.trim()) return
    setSubmitting(true)
    try {
      const payload:Omit<BookForm,'id'>={
        title: form.title,
        author: form.author,
        category: form.category,
        totalCopies: form.totalCopies,
        available: form.available,
        isbn: form.isbn,
      }
      const res = await fetch(API_BASE,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })
      const json: ApiEnvelope<BookApiResponse> = await res.json()
      if (!res.ok || !json.success) throw new Error(json.message ?? 'Failed to add book')

      setBooks(prev => [...prev, normaliseBook(json.data)])
      setModal(false)
      setForm(INITIAL_FORM)
    } catch (err){
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered: Book[] = books.filter(
    b =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase())
  )

  interface Stat {
    label: string
    value: number
    color: string
    bg: string
  }

  const stats: Stat[] = [
    { label: 'Total Books', value: books.reduce((a, b) => a + b.total, 0),color: '#1e3a5f',bg:'#e0e7ff'},
    { label: 'Available',   value: books.reduce((a, b) => a + b.available, 0),color:'#059669',bg:'#d1fae5'},
    { label: 'Issued',      value: books.reduce((a, b) => a + (b.total - b.available), 0),color: '#d97706',bg:'#fef3c7'},
    { label: 'Titles',      value: books.length,color: '#7c3aed',bg:'#ede9fe'},
  ]

  return (
    <AppLayout title="Library Management" subtitle="Manage books and library inventory">
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '14px 22px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'Syne,sans-serif' }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            placeholder="Search books…"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={fetchBooks}
          title="Refresh"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={15} />
        </button>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Add Book
        </button>
      </div>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 60, color: '#64748b' }}>
          <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Loading books…</span>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 60, color: '#ef4444' }}>
          <AlertCircle size={32} />
          <p style={{ fontWeight: 600 }}>{error}</p>
          <button className="btn btn-outline btn-sm" onClick={fetchBooks}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <BookOpen size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>{search ? 'No books match your search.' : 'No books yet. Add one!'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {filtered.map((b: Book) => {
            const issuedPct = ((b.total - b.available) / b.total) * 100
            return (
              <div key={b.id} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ height: 4, background: b.available === 0 ? '#ef4444' : '#1e3a5f' }} />
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <BookOpen size={20} color="#1e3a5f" />
                    <span
                      className={`badge badge-${b.available === 0 ? 'danger' : b.available < 3 ? 'warning' : 'success'}`}
                      style={{ fontSize: 11 }}
                    >
                      {b.available === 0 ? 'All Issued' : `${b.available} Available`}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14, marginBottom: 4, lineHeight: 1.4 }}>{b.title}</h4>
                  <p style={{ fontSize: 12.5, color: '#64748b', marginBottom: 4 }}>by {b.author}</p>
                  <p style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 12 }}>ISBN: {b.isbn}</p>
                  <span className="badge badge-purple" style={{ fontSize: 11, marginBottom: 12 }}>{b.category}</span>

                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#64748b', marginBottom: 5 }}>
                      <span>Issued: {b.total - b.available}/{b.total}</span>
                      <span>{Math.round(issuedPct)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${issuedPct}%`, background: issuedPct === 100 ? '#ef4444' : '#1e3a5f' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {modal && (
        <div
          className="modal-overlay"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && setModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>📚 Add New Book</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid-2">

                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Book Title</label>
                  <input
                    className="form-control"
                    placeholder="Full book title"
                    value={form.title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author</label>
                  <input
                    className="form-control"
                    placeholder="Author name"
                    value={form.author}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, author: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Total Copies</label>
                  <input
                    className="form-control"
                    type="number"
                    min={1}
                    value={form.totalCopies}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, totalCopies: parseInt(e.target.value, 10) || 1 })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Available</label>
                  <input
                    className="form-control"
                    type="number"
                    min={0}
                    max={form.totalCopies}
                    value={form.available}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setForm({ ...form, available: parseInt(e.target.value, 10) || 0 })
                    }
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">ISBN</label>
                  <input
                    className="form-control"
                    placeholder="ISBN number"
                    value={form.isbn}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, isbn: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={submitting || !form.title.trim() || !form.author.trim()}
              >
                {submitting
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Adding…</>
                  : 'Add Book'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}