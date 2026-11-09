import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  Folder,
  StickyNote,
  Bookmark,
  Highlighter,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Shell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    ["/app", "Overview", BookOpen],
    ["/app/library", "My Library", Library],
    ["/app/collections", "Collections", Folder],
    ["/app/notes", "Notes", StickyNote],
    ["/app/bookmarks", "Bookmarks", Bookmark],
    ["/app/highlights", "Highlights", Highlighter],
    ["/app/settings", "Settings", Settings],
  ];

  const nav = (
    <>
      {links.map(([to, label, Icon]) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/app"}
          onClick={() => setOpen(false)}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={21} />
          </div>

          <span>my library</span>

          <button
            className="mobile-close icon-button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <div className="side-label">WORKSPACE</div>

        <nav>{nav}</nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>

          <button className="nav-link logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {open && (
        <button
          className="mobile-scrim"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main content */}
      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Your personal space
            <span>/</span>
            <b>Library</b>
          </div>

          <div className="top-actions">
            <span className="local-indicator">
              <i />
              Local-first
            </span>

            <button
              className="primary-button small"
              onClick={() => navigate("/app/library?upload=1")}
            >
              <Plus size={16} />
              Add book
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
