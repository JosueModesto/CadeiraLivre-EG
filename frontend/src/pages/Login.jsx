import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [userType, setUserType] = useState("client");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !senha) {
        setError("Email e senha são obrigatórios");
        setLoading(false);
        return;
      }

      await login(email, senha);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Erro ao fazer login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProfile = (type) => {
    setUserType(type);
  };

  const styles = {
    container: {
      background: "#121212",
      color: "#eae1d4",
      overflow: "hidden",
    },
    glassCard: {
      background: "rgba(30, 30, 30, 0.8)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(212, 175, 55, 0.15)",
      boxShadow: "0 0 40px rgba(0, 0, 0, 0.5)",
    },
    goldGlow: {
      boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
    },
    bgMesh: {
      backgroundImage: "radial-gradient(circle at 50% -20%, #2a220a 0%, #121212 70%)",
    },
    particleOverlay: {
      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA5kPK5K0r8FrYW-JxvZOaRt5v4I586PWF6tnd1WDLKzKZCY-1OiwleXPTIXo02oVrRxxcGerOq3rqeS6JXhxdlZhhFKshhBM-CbJZpPwkkWHoTEQtrwSglPN2Qx8v-U8thJYXlw2BgsZZvmlIrky8e-x6ByyLoF2UJjx1D45HRToYowjrEtv9qSASipeLUz9QAs8_hC2tf53vS3Xuw5dQfCCMC4nNq7gumAQ_Fh-El2Uiqt8U7N0e4JNayMCm8B-cFA8xTvy2VBziJ')",
    },
    primaryButton: {
      background: "#f2ca50",
      color: "#3c2f00",
      border: "none",
      padding: "16px 24px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      transition: "all 0.4s ease",
      boxShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
    },
    secondaryButton: {
      background: "transparent",
      color: "#d0c5af",
      border: "1px solid rgba(78, 70, 53, 0.3)",
      padding: "12px 16px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div
      style={{
        ...styles.container,
        ...styles.bgMesh,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: 'Inter, sans-serif',
        fontSize: "16px",
        padding: "20px",
      }}
    >
      {/* Atmospheric Particles */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.2,
          ...styles.particleOverlay,
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        .headline-lg {
          font-family: Montserrat;
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.01em;
          font-weight: 600;
        }
        
        .body-lg {
          font-family: Inter;
          font-size: 18px;
          line-height: 28px;
          font-weight: 400;
        }
        
        .label-md {
          font-family: Inter;
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.05em;
          font-weight: 500;
        }
        
        .label-sm {
          font-family: Inter;
          font-size: 12px;
          line-height: 16px;
          letter-spacing: 0.08em;
          font-weight: 600;
        }
        
        .headline-md {
          font-family: Montserrat;
          font-size: 24px;
          line-height: 32px;
          font-weight: 600;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .gold-glow-hover:hover {
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.5);
        }
        
        .transition-all {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        input {
          font-family: Inter;
        }
        
        button {
          font-family: Inter;
        }
      `}</style>

      <main
        style={{
          width: "100%",
          maxWidth: "1280px",
          display: "flex",
          flexDirection: window.innerWidth < 768 ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "128px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left Side: Branding */}
        <div
          style={{
            display: window.innerWidth >= 768 ? "flex" : "none",
            flexDirection: "column",
            alignItems: "flex-start",
            maxWidth: "448px",
            animation: "fadeIn 0.8s ease-out",
          }}
          className="hidden md:flex animate-fade-in"
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#f2ca50",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "24px",
            }}
            className="headline-lg"
          >
            CADEIRA LIVRE
          </h1>
          <p
            style={{
              color: "#d0c5af",
              lineHeight: "28px",
              marginBottom: "64px",
            }}
            className="body-lg"
          >
            Redefinindo a experiência do homem moderno. Reserve seu lugar na excelência e sinta o prestígio de um atendimento exclusivo.
          </p>
          <div style={{ display: "flex", gap: "24px", marginTop: "64px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: "600", color: "#f2ca50" }} className="headline-md">
                +500
              </span>
              <span style={{ fontSize: "12px", color: "#d0c5af", textTransform: "uppercase" }} className="label-sm">
                Barbearias Elite
              </span>
            </div>
            <div style={{ width: "1px", height: "48px", background: "rgba(242, 202, 80, 0.2)" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "24px", fontWeight: "600", color: "#f2ca50" }} className="headline-md">
                15k
              </span>
              <span style={{ fontSize: "12px", color: "#d0c5af", textTransform: "uppercase" }} className="label-sm">
                Membros Ativos
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            ...styles.glassCard,
            borderRadius: "12px",
            padding: "32px",
          }}
        >
          {/* Mobile Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }} className="md:hidden">
            <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#f2ca50", textTransform: "uppercase" }} className="headline-md">
              CADEIRA LIVRE
            </h1>
          </div>

          {/* Profile Selector */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{ fontSize: "12px", color: "#d0c5af", textTransform: "uppercase", display: "block", marginBottom: "12px", textAlign: "center" }} className="label-sm">
              Selecione seu acesso
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                padding: "4px",
                background: "rgba(35, 31, 23, 0.5)",
                borderRadius: "8px",
                border: "1px solid rgba(212, 175, 55, 0.05)",
              }}
            >
              <button
                onClick={() => toggleProfile("client")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "6px",
                  ...styles.transition,
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  background: userType === "client" ? "#f2ca50" : "transparent",
                  color: userType === "client" ? "#3c2f00" : "#d0c5af",
                  boxShadow: userType === "client" ? "0 0 15px rgba(212, 175, 55, 0.3)" : "none",
                }}
                className="label-md"
              >
                👤 CLIENTE
              </button>
              <button
                onClick={() => toggleProfile("shop")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  borderRadius: "6px",
                  ...styles.transition,
                  fontSize: "12px",
                  fontWeight: "600",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  background: userType === "shop" ? "#f2ca50" : "transparent",
                  color: userType === "shop" ? "#3c2f00" : "#d0c5af",
                  boxShadow: userType === "shop" ? "0 0 15px rgba(212, 175, 55, 0.3)" : "none",
                }}
                className="label-md"
              >
                ✂️ BARBEARIA
              </button>
            </div>
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#eae1d4", marginBottom: "8px" }} className="headline-md">
            {userType === "client" ? "Bem-vindo de volta" : "Painel da Barbearia"}
          </h2>
          <p style={{ fontSize: "16px", color: "#d0c5af", marginBottom: "24px" }} className="body-md">
            Insira suas credenciais para acessar o lounge.
          </p>

          {/* Error */}
          {error && (
            <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255, 180, 171, 0.2)", border: "1px solid rgba(255, 107, 107, 0.5)", borderRadius: "8px", color: "#ffb4ab", fontSize: "12px" }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", color: "#d0c5af", textTransform: "uppercase" }} className="label-sm">
                E-mail
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  style={{
                    width: "100%",
                    background: "#110e07",
                    borderBottom: "1px solid rgba(78, 70, 53, 0.3)",
                    padding: "16px 48px 16px 16px",
                    color: "#eae1d4",
                    fontSize: "16px",
                    outline: "none",
                    borderRadius: "8px 8px 0 0",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderBottom = "1px solid #f2ca50")}
                  onBlur={(e) => (e.target.style.borderBottom = "1px solid rgba(78, 70, 53, 0.3)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "12px", color: "#d0c5af", textTransform: "uppercase" }} className="label-sm">
                  Senha
                </label>
                <a href="#" style={{ fontSize: "12px", color: "#f2ca50", textDecoration: "none", cursor: "pointer" }}>
                  Esqueceu a senha?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    background: "#110e07",
                    borderBottom: "1px solid rgba(78, 70, 53, 0.3)",
                    padding: "16px 48px 16px 16px",
                    color: "#eae1d4",
                    fontSize: "16px",
                    outline: "none",
                    borderRadius: "8px 8px 0 0",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderBottom = "1px solid #f2ca50")}
                  onBlur={(e) => (e.target.style.borderBottom = "1px solid rgba(78, 70, 53, 0.3)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#d0c5af",
                    fontSize: "18px",
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                ...styles.primaryButton,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              className="gold-glow-hover"
              onMouseOver={(e) => !loading && (e.target.style.boxShadow = "0 0 25px rgba(212, 175, 55, 0.5)")}
              onMouseOut={(e) => !loading && (e.target.style.boxShadow = "0 0 15px rgba(212, 175, 55, 0.3)")}
            >
              {loading ? "Conectando..." : "Acessar Lounge"}
            </button>
          </form>

          {/* Sign Up */}
          <p style={{ marginTop: "32px", textAlign: "center", fontSize: "14px", color: "#d0c5af" }} className="body-md">
            Não possui conta?{" "}
            <a href="#" style={{ color: "#f2ca50", fontWeight: "bold", textDecoration: "none", cursor: "pointer" }}>
              Solicite convite
            </a>
          </p>
        </div>
      </main>

      {/* Bottom accent */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: "linear-gradient(to right, transparent, rgba(242, 202, 80, 0.4), transparent)",
        }}
      />
    </div>
  );
}
