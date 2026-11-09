import { useEffect,useState } from 'react';
import { Bookmark,Trash2 } from 'lucide-react';
import { all,remove } from '../storage/db';
import { listBooks } from '../storage/library';
import { Link } from 'react-router-dom';
export default function Bookmarks(){
 const [items,setItems]=useState([]);const [books,setBooks]=useState([]);
 async function refresh(){setItems((await all('bookmarks')).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));setBooks(await listBooks());}
 useEffect(()=>{refresh();},[]);
 return <div><div className="eyebrow">SAVED FOR LATER</div><h1>Bookmarks</h1><p className="muted">Places you want to return to.</p>
 {items.length?<div className="simple-list">{items.map(item=><div className="list-row" key={item.id}><Bookmark/><div className="list-main"><strong>{item.label}</strong><small>{books.find(b=>b.id===item.bookId)?.title||'Book'} · {String(item.position)}</small></div><Link to={`/app/read/${item.bookId}`}>Open</Link><button className="icon-button" onClick={async()=>{await remove('bookmarks',item.id);refresh();}}><Trash2 size={16}/></button></div>)}</div>:<div className="empty-state compact"><Bookmark/><h3>No bookmarks yet</h3><p>Save a page or reading position from inside a book.</p></div>}
 </div>;
}
