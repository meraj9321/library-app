import { useEffect,useState } from 'react';
import { StickyNote, Trash2, Plus } from 'lucide-react';
import { addNote,all,deleteNote,listBooks } from '../storage/library';
export default function Notes(){
 const [notes,setNotes]=useState([]);const [books,setBooks]=useState([]);
 async function refresh(){setNotes((await all('notes')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));setBooks(await listBooks());}
 useEffect(()=>{refresh();},[]);
 async function create(){const content=prompt('Write your note');if(content?.trim()){await addNote(null,content);refresh();}}
 return <div><div className="page-title-row"><div><div className="eyebrow">THOUGHTS WORTH KEEPING</div><h1>My Notes</h1><p className="muted">Collect ideas, reminders and reading reflections.</p></div><button className="primary-button" onClick={create}><Plus size={17}/> New note</button></div>
 {notes.length?<div className="notes-grid">{notes.map(n=><article className="note-card" key={n.id}><div className="note-card-top"><StickyNote size={18}/><button className="icon-button" onClick={async()=>{if(confirm('Delete this note?')){await deleteNote(n.id);refresh();}}}><Trash2 size={16}/></button></div><p>{n.content}</p><small>{n.bookId?books.find(b=>b.id===n.bookId)?.title||'Book note':'Personal note'} · {new Date(n.createdAt).toLocaleDateString()}</small></article>)}</div>:<div className="empty-state compact"><div className="empty-icon"><StickyNote/></div><h3>Your thoughts belong here</h3><p>Create a note to remember an idea or capture what you learn.</p><button className="primary-button" onClick={create}>Create a note</button></div>}
 </div>;
}
