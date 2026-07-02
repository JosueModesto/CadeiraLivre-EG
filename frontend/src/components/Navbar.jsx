import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ title, onBack }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="row">
          {onBack ? (
            <button className="btn btn--ghost btn--sm" onClick={onBack}>
              ← Voltar
            </button>
          ) : null}
          <button
            className="brand"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            <span className="scissors">✂</span> Cadeira Livre
          </button>
        </div>

        {title ? <span className="nav-title">{title}</span> : null}

        <div className="nav-actions">
          {user ? (
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {user.nome}
            </span>
          ) : null}
          <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
