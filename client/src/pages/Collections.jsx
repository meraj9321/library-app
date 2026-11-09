import { useEffect,useState } from 'react';
import { FolderPlus, Folder, ArrowUpRight } from 'lucide-react';
import { addCollection,all,listBooks,updateBook } from '../storage/library';
import { Link } from 'react-router-dom';

export default function Collections(){
 const [collections,setCollections]=useState([]);const [books,setBooks]=useState([]);
 async function refresh(){setCollections(await all('collections'));setBooks(await listBooks());}
 useEffect(()=>{refresh();},[]);
 async function create(){const name=prompt('Collection name');if(name?.trim()){await addCollection(name);refresh();}}
 return <div><div className="page-title-row"><div><div className="eyebrow">MAKE IT YOURS</div><h1>Collections</h1><p className="muted">Bring related books and documents together.</p></div><button className="primary-button" onClick={create}><FolderPlus size={17}/> New collection</button></div>
 <div className="collection-grid">{collections.map(c=><div className="collection-card" key={c.id}><div className="collection-icon"><Folder/></div><h3>{c.name}</h3><p>{books.filter(b=>b.collectionId===c.id).length} items</p><Link to={`/app/library?collection=${c.id}`}>Browse collection <ArrowUpRight size={14}/></Link></div>)}</div>
 {!collections.length&&<div className="empty-state compact"><div className="empty-icon"><Folder/></div><h3>Make room for a new idea</h3><p>Create collections for subjects, projects or reading lists.</p><button className="primary-button" onClick={create}>Create collection</button></div>}
 {books.length>0&&collections.length>0&&<div className="section-block"><h2>Organize your books</h2><p className="muted">Assign a book to a collection from its details. Collection assignment controls are coming to the book editor in the next refinement.</p></div>}
 </div>;
}
