import { useState } from 'react';
import { BookOpen, Mail, Lock, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode='login' }) {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const {login,register}=useAuth(); const navigate=useNavigate();
  const isRegister=mode==='register';
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{if(isRegister) await register(name,email,password); else await login(email,password);navigate('/app');}catch(err){setError(err.message);}finally{setBusy(false);}}
  return <div className="auth-page"><div className="auth-art"><div className="auth-art-content"><div className="brand light"><div className="brand-icon"><BookOpen/></div><span>my library</span></div><div className="auth-quote">A little space<br/>for everything<br/><em>you want to learn.</em></div><p>Your books, thoughts and discoveries — beautifully together.</p><div className="floating-books"><span>THE ART OF<br/>SLOW LIVING</span><span>DESIGN<br/>NOTES</span><span>READ<br/>MORE</span></div></div></div>
  <div className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><div className="auth-mobile-brand"><BookOpen/> my library</div><div className="eyebrow">YOUR PERSONAL LIBRARY</div><h1>{isRegister?'Create your account':'Welcome back'}</h1><p className="muted">{isRegister?'Start building a library that belongs to you.':'Sign in to return to your reading space.'}</p>
  {isRegister&&<label className="field"><span>Your name</span><div className="input-wrap"><UserRound size={18}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Alex Morgan" required minLength="2"/></div></label>}
  <label className="field"><span>Email address</span><div className="input-wrap"><Mail size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
  <label className="field"><span>Password</span><div className="input-wrap"><Lock size={18}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required minLength="8"/></div></label>
  {error&&<div className="error-message">{error}</div>}<button className="primary-button full" disabled={busy}>{busy?'Please wait…':isRegister?'Create account':'Sign in'}</button>
  <div className="auth-switch">{isRegister?'Already have an account?':'New to My Library?'} <Link to={isRegister?'/login':'/register'}>{isRegister?'Sign in':'Create an account'}</Link></div>
  <div className="auth-foot">Your files stay on your device unless you choose to back them up.</div></form></div></div>;
}
