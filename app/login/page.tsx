'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage(){

  const router = useRouter();
  const [role,setRole] = useState<'admin' | 'teacher'>('admin');
  const [showPass,setShowPass] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [form,setForm] = useState({email:'',password:''});

const handleLogin = async (e:React.FormEvent)=>{
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body:JSON.stringify({
        email:form.email,
        password:form.password,
        role:role,
      }),
    });
    const data = await res.json();
    if (!res.ok){
      throw new Error(data.message || 'Login failed');
    }
    if (data?.token){
      localStorage.setItem('authToken',data.token); 
    }
    if (data?.user){
      localStorage.setItem('user',JSON.stringify(data.user));
    }
    router.push('/dashboard');
  } catch (err:any){
    setError(err.message);
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="icon">🏫</div>
          <h1>EduManage</h1>
          <p>School Management System</p>
        </div>
        {error && (
          <p style={{color:'red',fontSize:13,marginBottom:10}}>
            {error}
          </p>
        )}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}/>
              <input
                className="form-control"
                type="email"
                placeholder={role === 'admin' ? 'admin@school.edu' : 'teacher@school.edu'}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: 38 }}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }} />
              <input
                className="form-control"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ paddingLeft: 38, paddingRight: 38 }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: '#64748b',
              cursor: 'pointer'
            }}>
              <input type="checkbox" />
              <span> Remember me</span>
            </label>
            <a href="#" style={{
              fontSize: 13,
              color: '#1e3a5f',
              fontWeight: 600
            }}>
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px',
              fontSize: 15
            }}
          >
            {loading
              ? '⏳ Signing in...'
              : `Sign in as ${role === 'admin' ? 'Admin' : 'Teacher'}`}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>
            Use real credentials to login
          </p>
        </div>
      </div>
    </div>
  );
}