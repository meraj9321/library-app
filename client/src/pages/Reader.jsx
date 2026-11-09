import { useEffect,useRef,useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import { ArrowLeft,ChevronLeft,ChevronRight,ZoomIn,ZoomOut,Bookmark,StickyNote,Sun,Moon,Download,Highlighter } from 'lucide-react';
import { getBook,getProgress,saveProgress,addBookmark,addNote,addHighlight } from '../storage/library';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import ePub from 'epubjs';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function Reader(){
 const {id}=useParams();const navigate=useNavigate();const [book,setBook]=useState(null);const [error,setError]=useState('');const [page,setPage]=useState(1);const [pages,setPages]=useState(1);const [scale,setScale]=useState(1.15);const [dark,setDark]=useState(false);const canvas=useRef(null);const epubHost=useRef(null);const pdfDoc=useRef(null);const rendition=useRef(null);
 useEffect(()=>{getBook(id).then(b=>{if(!b){setError('This book is not available in this browser.');return;}setBook(b);getProgress(id).then(p=>{if(p?.position)setPage(Number(p.position)||1);});}).catch(e=>setError(e.message));},[id]);
 useEffect(()=>{if(!book)return;let cancelled=false;
  async function render(){
   try{
    if(book.format==='PDF'){
      const data=await book.file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data}).promise;if(cancelled)return;pdfDoc.current=pdf;setPages(pdf.numPages);const saved=await getProgress(id);const target=Math.min(Math.max(Number(saved?.position)||1,1),pdf.numPages);setPage(target);await renderPdfPage(pdf,target);
    } else if(book.format==='EPUB'){
      const epubBook=ePub(await book.file.arrayBuffer());const r=epubBook.renderTo(epubHost.current,{width:'100%',height:'100%',flow:'paginated'});rendition.current=r;const saved=await getProgress(id);r.display(saved?.cfi || undefined);r.on('relocated',location=>{if(location?.start?.cfi)saveProgress(id,location.start.displayed.page || 1,{cfi:location.start.cfi});});
    } else if(book.format==='DOCX'){
      const result=await mammoth.convertToHtml({arrayBuffer:await book.file.arrayBuffer()});if(!cancelled)epubHost.current.innerHTML=DOMPurify.sanitize(result.value || '<p>This document has no readable text.</p>');
    } else {
      const text=await book.file.text();if(!cancelled)epubHost.current.textContent=text;
    }
   }catch(e){setError(`Could not open this document: ${e.message}`);}
  }
  render();return()=>{cancelled=true;try{rendition.current?.destroy();}catch{}};
 },[book]);
 async function renderPdfPage(pdf,n){if(!canvas.current)return;const p=await pdf.getPage(n);const viewport=p.getViewport({scale});const c=canvas.current;c.width=viewport.width;c.height=viewport.height;await p.render({canvasContext:c.getContext('2d'),viewport}).promise;}
 useEffect(()=>{if(book?.format==='PDF'&&pdfDoc.current)renderPdfPage(pdfDoc.current,page);},[page,scale,book]);
 async function move(n){const next=Math.min(Math.max(n,1),pages);setPage(next);await saveProgress(id,next);}
 async function bookmark(){await addBookmark(id,book.format==='PDF'?page:page,`${book.title} · ${book.format==='PDF'?'Page '+page:'Reading position'}`);alert('Bookmark saved.');}
 async function note(){const content=prompt('Add a note about this reading position');if(content?.trim()){await addNote(id,content,book.format==='PDF'?`Page ${page}`:'Reading position');alert('Note saved.');}}
 async function highlight(){let selected=window.getSelection()?.toString().trim();if(!selected && book.format==='EPUB'){for(const content of rendition.current?.getContents?.()||[]){selected=content.window?.getSelection?.()?.toString().trim();if(selected)break;}}if(!selected){alert('Select some text in this document first. Text selection is supported in DOCX, TXT and EPUB content.');return;}await addHighlight(id,selected,book.format==='PDF'?`Page ${page}`:'Selected passage');alert('Passage saved to Highlights.');}
 if(error)return <div className="reader-error"><button className="secondary-button" onClick={()=>navigate('/app/library')}><ArrowLeft/> Back to library</button><h2>{error}</h2></div>;
 if(!book)return <div className="loading-screen">Opening your book…</div>;
 return <div className={`reader-page ${dark?'reader-dark':''}`}><header className="reader-toolbar"><button className="icon-button" onClick={()=>navigate('/app/library')}><ArrowLeft/></button><div className="reader-book-title"><strong>{book.title}</strong><small>{book.format} · Stored on this device</small></div><div className="reader-tools">{book.format==='PDF'&&<><button className="icon-button" onClick={()=>setScale(s=>Math.max(.6,s-.15))}><ZoomOut/></button><span>{Math.round(scale*100)}%</span><button className="icon-button" onClick={()=>setScale(s=>Math.min(2.5,s+.15))}><ZoomIn/></button></>}<button className="icon-button" onClick={bookmark} title="Bookmark"><Bookmark/></button><button className="icon-button" onClick={note} title="Add note"><StickyNote/></button><button className="icon-button" onClick={highlight} title="Save selected text as highlight"><Highlighter/></button><button className="icon-button" onClick={()=>setDark(!dark)} title="Toggle reading theme">{dark?<Sun/>:<Moon/>}</button><a className="icon-button" href={URL.createObjectURL(book.file)} download={book.fileName} title="Download original"><Download/></a></div></header>
 <div className="reader-workspace">{book.format==='PDF'?<div className="pdf-stage"><canvas ref={canvas}/></div>:<div className={`document-stage ${book.format==='TXT'?'plain-text':''}`} ref={epubHost}/>}</div>
 {book.format==='PDF'&&<footer className="reader-footer"><button className="secondary-button" disabled={page<=1} onClick={()=>move(page-1)}><ChevronLeft/> Previous</button><span>Page {page} of {pages}</span><button className="secondary-button" disabled={page>=pages} onClick={()=>move(page+1)}>Next <ChevronRight/></button></footer>}
 </div>;
}
