'use client'
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {RESULTS} from '@/lib/data';
import {Plus,X} from 'lucide-react';

const API_BASE = 'https://edumanagebackend-1.onrender.com/api/v1';

interface Exam {
  id: string;
  name: string;
  class: string;
  subject: string;
  date: string;
  maxMarks: number;
  status: string;
}

interface ApiExam {
  _id: string;
  name: string;
  class: string;
  subject: string;
  examDate: string;
  totalMarks: number;
  status: string;
}

function mapApiExam(e:ApiExam):Exam{
  return {
    id: e._id,
    name: e.name,
    class: e.class,
    subject: e.subject,
    date: e.examDate ? new Date(e.examDate).toISOString().split('T')[0] : '',
    maxMarks: e.totalMarks,
    status: e.status,
  };
}

export default function ExamsPage(){
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [results] = useState(RESULTS);
  const [tab, setTab] = useState<'exams' | 'results'>('exams');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    class: '10-A',
    subject: '',
    date: '',
    maxMarks: 100,
    status: 'upcoming',
  });

  const gradeColor: Record<string,string>={
    'A+': 'success',
    A: 'success',
    B: 'info',
    C: 'warning',
    D: 'danger',
    F: 'danger',
  };

  const fetchExams = async ()=>{
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/exams`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      const raw: ApiExam[] = Array.isArray(json) ? json : json.data ?? [];
      setExams(raw.map(mapApiExam));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.subject || !form.date) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/exams`, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify({
          name: form.name,
          class: form.class,
          subject: form.subject,
          examDate: form.date,
          totalMarks: Number(form.maxMarks),
          status: form.status,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message ?? `Server error: ${res.status}`);
      }
      const json = await res.json();
      const created: ApiExam = json.data ?? json;
      setExams((prev) => [...prev, mapApiExam(created)]);
      setModal(false);
      setForm({ name: '', class: '10-A', subject: '', date: '', maxMarks: 100, status: 'upcoming' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to schedule exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Exams & Results" subtitle="Schedule exams and manage student results">
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: '#f0f4f8',
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
          width: 'fit-content',
        }}
      >
        {(['exams', 'results'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 22px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 600,
              fontSize: 13.5,
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              background: tab === t ? '#1e3a5f' : 'transparent',
              color: tab === t ? '#fff' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            {t === 'exams' ? '📝 Exams' : '🏆Results'}
          </button>
        ))}
      </div>
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#b91c1c',
            borderRadius: 8,
            padding: '10px 16px',
            marginBottom: 16,
            fontSize: 13.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background:'none',border:'none',cursor:'pointer',color:'#b91c1c'}}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {tab === 'exams' && (
        <>
          <div className="toolbar">
            <div style={{ display: 'flex', gap: 10}}>
              {['upcoming', 'completed'].map((s) => (
                <span
                  key={s}
                  className={`badge badge-${s === 'upcoming' ? 'info' : 'success'}`}
                  style={{ fontSize: 12, padding: '5px 12px'}}
                >
                  {s}: {exams.filter((e) => e.status === s).length}
                </span>
              ))}
            </div>
            <div style={{ flex: 1 }}/>
            <button className="btn btn-primary" onClick={() => setModal(true)}>
              <Plus size={16}/> Schedule Exam
            </button>
          </div>
          <div className="card">
            {loading ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                Loading exams…
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Exam Name</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Max Marks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                          No exams found
                        </td>
                      </tr>
                    ) : (
                      exams.map((e, i) => (
                        <tr key={e.id}>
                          <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                          <td style={{ fontWeight: 600 }}>{e.name}</td>
                          <td>
                            <span className="badge badge-info">{e.class}</span>
                          </td>
                          <td>{e.subject}</td>
                          <td>{e.date}</td>
                          <td style={{ fontWeight: 600, color: '#1e3a5f' }}>{e.maxMarks}</td>
                          <td>
                            <span className={`badge badge-${e.status === 'upcoming' ? 'warning' : 'success'}`}>
                              {e.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      {tab === 'results' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{r.student}</td>
                    <td>
                      <span className="badge badge-info">{r.class}</span>
                    </td>
                    <td>{r.exam}</td>
                    <td>{r.subject}</td>
                    <td>
                      <strong>{r.marks}</strong>
                      <span style={{ color: '#94a3b8' }}>/{r.maxMarks}</span>
                      <div className="progress-bar" style={{ marginTop: 4, width: 60 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(r.marks / r.maxMarks) * 100}%`,
                            background: '#1e3a5f',
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${gradeColor[r.grade] || 'gray'}`}>{r.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>📝 Schedule Exam</h3>
              <button className="btn btn-outline btn-sm btn-icon" onClick={() => setModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Exam Name</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Unit Test 1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select
                    className="form-control"
                    value={form.class}
                    onChange={(e) => setForm({ ...form, class: e.target.value })}
                  >
                    {['10-A', '10-B', '9-A', '9-B', '8-A', '8-B'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Mathematics"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    className="form-control"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Marks</label>
                  <input
                    className="form-control"
                    type="number"
                    value={form.maxMarks}
                    onChange={(e) => setForm({ ...form, maxMarks: +e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={submitting}>
                {submitting ? 'Scheduling…':'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}