import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Collections from './pages/Collections';
import Notes from './pages/Notes';
import Bookmarks from './pages/Bookmarks';
import Highlights from './pages/Highlights';
import Settings from './pages/Settings';
import Reader from './pages/Reader';

function PrivateShell(){return <ProtectedRoute><Shell/></ProtectedRoute>;}
export default function App(){
 return <Routes>
  <Route path="/login" element={<Auth/>}/><Route path="/register" element={<Auth mode="register"/>}/>
  <Route path="/app" element={<PrivateShell/>}>
   <Route index element={<Dashboard/>}/><Route path="library" element={<Library/>}/><Route path="collections" element={<Collections/>}/>
   <Route path="notes" element={<Notes/>}/><Route path="bookmarks" element={<Bookmarks/>}/><Route path="highlights" element={<Highlights/>}/>
   <Route path="settings" element={<Settings/>}/><Route path="read/:id" element={<Reader/>}/>
  </Route>
  <Route path="*" element={<Navigate to="/app" replace/>}/>
 </Routes>;
}
