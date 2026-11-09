import { BookOpen, FileText, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const covers = [
  "linear-gradient(145deg, #243d5a, #456786)",
  "linear-gradient(145deg, #754b3e, #a66e51)",
  "linear-gradient(145deg, #334d43, #617d65)",
  "linear-gradient(145deg, #51415e, #80698c)",
  "linear-gradient(145deg, #80643c, #b28d55)",
  "linear-gradient(145deg, #315d68, #548994)",
  "linear-gradient(145deg, #713e50, #a96370)",
  "linear-gradient(145deg, #39445c, #687b9a)",
];

export default function BookCard({ book, onFavorite }) {
  const navigate = useNavigate();

  const color = covers[(book.title?.length || 0) % covers.length];

  return (
    <article className="book-card">
      <button
        className="book-cover"
        style={{ "--cover": color }}
        onClick={() => navigate(`/app/read/${book.id}`)}
        aria-label={`Read ${book.title}`}
      >
        <span className="cover-mark">
          {book.format === "PDF" ? <FileText /> : <BookOpen />}
        </span>

        <span className="cover-title">{book.title}</span>

        <span className="cover-author">{book.author || book.format}</span>
      </button>

      <div className="book-meta">
        <div className="book-name" title={book.title}>
          {book.title}
        </div>

        <div className="book-sub">
          {book.author || `${book.format} document`}
        </div>
      </div>

      <button
        className={`favorite-button ${book.favorite ? "is-favorite" : ""}`}
        onClick={() => onFavorite(book)}
        title="Toggle favourite"
        aria-label={
          book.favorite ? "Remove from favourites" : "Add to favourites"
        }
      >
        <Star size={17} fill={book.favorite ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
