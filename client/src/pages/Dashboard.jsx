import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Clock3, FilePlus2, HardDrive, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listBooks, storageUsage, all } from '../storage/library';
import BookCard from '../components/BookCard';

export default function Dashboard(){
  const [books,setBooks]=useState([]);const [usage,setUsage]=useState({count:0,bytes:0});const [notes,setNotes]=useState([]);
  async function refresh(){const b=await listBooks();setBooks(b);setUsage(await storageUsage());setNotes(await all('notes'));}
  useEffect(()=>{refresh();},[]);
  const recent=books.slice(0,4);
  const size=(usage.bytes/1024/1024).toFixed(1);
  return <div className="dashboard-page">
    <section className="welcome-row"><div><div className="eyebrow">MONDAY, YOUR WAY</div><h1>Your library, <em>your pace.</em></h1><p className="muted">A calm place to keep what you're reading and what you're learning.</p></div><Link className="text-link" to="/app/library">Explore library <ArrowUpRight size={16}/></Link></section>
    <section className="hero-panel"><div className="hero-copy"><span className="hero-kicker"><Sparkles size={14}/> A SPACE TO GROW</span><h2>Every great idea<br/>starts with a <em>page.</em></h2><p>Bring your books, documents and notes together in one thoughtful space.</p><Link to="/app/library?upload=1" className="hero-button">Add your first book <ArrowUpRight size={16}/></Link></div><div className="hero-illustration"><div className="hero-book book-one">THE<br/>CREATIVE<br/>MIND</div><div className="hero-book book-two">A FIELD<br/>GUIDE TO<br/>IDEAS</div><div className="hero-book book-three">NOTES<br/>ON<br/>LIVING</div><div className="hero-sun"/></div></section>
    <section className="stats-grid"><div className="stat-card"><span className="stat-icon"><BookOpen/></span><div><strong>{usage.count}</strong><small>Books & documents</small></div></div><div className="stat-card"><span className="stat-icon"><HardDrive/></span><div><strong>{size} MB</strong><small>Local storage used</small></div></div><div className="stat-card"><span className="stat-icon"><FilePlus2/></span><div><strong>{notes.length}</strong><small>Personal notes</small></div></div><div className="stat-card"><span className="stat-icon"><Clock3/></span><div><strong>{books.length? 'In progress':'Ready when you are'}</strong><small>Reading journey</small></div></div></section>
    <section className="section-block"><div className="section-heading"><div><div className="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2>Recently added</h2></div><Link to="/app/library" className="text-link">View all <ArrowUpRight size={16}/></Link></div>
    {recent.length?<div className="book-grid">{recent.map(book=><BookCard key={book.id} book={book} onFavorite={async b=>{b.favorite=!b.favorite;const {updateBook}=await import('../storage/library');await updateBook(b);refresh();}}/>)}</div>:<div className="empty-state"><div className="empty-icon"><BookOpen/></div><h3>Your shelf is waiting</h3><p>Add a PDF, EPUB, DOCX or TXT file to start your library.</p><Link to="/app/library?upload=1" className="primary-button">Add your first book</Link></div>}</section>
  </div>;
}
