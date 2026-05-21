'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Eye,EyeOff,Lock,Mail,AlertCircle,Shield,BookOpen} from 'lucide-react';

export default function LoginPage(){
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'teacher'>('admin');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({email:'',password:''});
  
  const handleLogin = async ()=>{
    if (!form.email.trim()){
      setError('Please enter your email address.');
      return;
    }
    if (!form.password){
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'https://edumanagebackend-1.onrender.com/api/v1/auth/login',
        {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            role,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok){
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }
      if (!data?.token){
        throw new Error('No token received. Please try again.');
      }
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('token',data.token);
      if (data?.user){
        storage.setItem('user', JSON.stringify(data.user));
      }
      // router.push('/dashboard');
    } catch (err:any){
      if (err.name === 'TypeError'){
        setError('Cannot reach the server. Check your internet connection.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e:React.KeyboardEvent)=>{
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>🏫</div>
          <h1 style={styles.appTitle}>EduManage</h1>
          <p style={styles.appSub}>School Management System</p>
        </div>
        <div style={styles.roleRow}>
          {(['admin', 'teacher'] as const).map((r)=>(
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                ...styles.roleBtn,
                ...(role === r ? styles.roleBtnActive :{}),
              }}
            >
              {r === 'admin' ? <Shield size={14} /> : <BookOpen size={14}/>}
              {r === 'admin' ? 'Admin' : 'Teacher'}
            </button>
          ))}
        </div>
        {error && (
          <div style={styles.errorBox} role="alert">
            <AlertCircle size={15} style={{flexShrink:0}}/>
            <span style={{ fontSize: 13 }}>{error}</span>
          </div>
        )}
        <div style={styles.field}>
          <label style={styles.label}>Email Address</label>
          <div style={{ position:'relative'}}>
            <Mail size={15} style={styles.inputIcon}/>
            <input
              type="email"
              placeholder={role === 'admin' ? 'admin@school.edu' : 'teacher@school.edu'}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value})}
              onKeyDown={handleKeyDown}
              style={styles.input}
              autoComplete="email"
              required
            />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <div style={{position:'relative'}}>
            <Lock size={15} style={styles.inputIcon}/>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value })}
              onKeyDown={handleKeyDown}
              style={{ ...styles.input, paddingRight: 40 }}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
              aria-label="Toggle password visibility"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div style={styles.extras}>
          <label style={styles.rememberLabel}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: '#0f2544' }}
            />
            Remember me
          </label>
          <a href="#" style={styles.forgot}>Forgot password?</a>
        </div>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <span style={styles.spinner} />
              Signing in…
            </>
          ) : (
            `Sign in as ${role === 'admin' ? 'Admin' : 'Teacher'}`
          )}
        </button>

        <p style={styles.footerNote}>Enter your credentials to continue</p>
      </div>
    </div>
  );
}
const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f2544 0%, #1a3a6b 60%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
  },
  logoRow: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoIcon: {
    width: 56,
    height: 56,
    background: '#0f2544',
    borderRadius: 14,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    marginBottom: '0.75rem',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#0f2544',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  appSub: {
    fontSize: 13,
    color: '#94a3b8',
  },
  roleRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: '1.5rem',
    background: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  roleBtn: {
    padding: '9px 12px',
    border: 'none',
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    background: 'transparent',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.2s',
  },
  roleBtnActive: {
    background: '#0f2544',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(15,37,68,0.25)',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1.5px solid #fecaca',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: '1.1rem',
    color: '#b91c1c',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  field: {
    marginBottom: '1.1rem',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 6,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '11px 12px 11px 38px',
    fontSize: 14,
    color: '#0f2544',
    outline: 'none',
    background: '#fafbfc',
    fontFamily: 'inherit',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  extras: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.4rem',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#64748b',
    cursor: 'pointer',
  },
  forgot: {
    fontSize: 13,
    color: '#1a3a6b',
    fontWeight: 600,
    textDecoration: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    borderRadius: 12,
    border: 'none',
    background: '#0f2544',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'inherit',
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footerNote: {
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: 12,
    color: '#cbd5e1',
  },
};