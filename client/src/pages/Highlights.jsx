import { useEffect,useState } from 'react';
import { Highlighter,Trash2 } from 'lucide-react';
import { all,remove } from '../storage/db';
import { listBooks } from '../storage/library';
import { Link } from 'react-router-dom';
export default function Highlights(){
 const [items,setItems]=useState([]);const [books,setBooks]=useState([]);
 async function refresh(){setItems((await all('highlights')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));setBooks(await listBooks());}
 useEffect(()=>{refresh();},[]);
 return <div><div className="eyebrow">IMPORTANT PASSAGES</div><h1>Highlights</h1><p className="muted">A home for the passages that stay with you.</p>
 {items.length?<div className="notes-grid">{items.map(item=><article className="note-card" key={item.id}><div className="note-card-top"><Highlighter size={18}/><button className="icon-button" onClick={async()=>{await remove('highlights',item.id);refresh();}}><Trash2 size={16}/></button></div><p>“{item.quote}”</p><small>{books.find(b=>b.id===item.bookId)?.title||'Book'} · {item.anchor}</small><div><Link className="text-link" to={`/app/read/${item.bookId}`}>Open book</Link></div></article>)}</div>:<div className="empty-state compact"><Highlighter/><h3>No highlights yet</h3><p>Open a DOCX or TXT document, select a passage and use the highlight action. PDF canvas highlighting is not supported in this initial reader.</p></div>}
 </div>;
}
