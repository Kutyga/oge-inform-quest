import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { TOKENS } from "./theme.js";
import { supabase } from "./supabaseClient.js";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${TOKENS.border}`,
  background: TOKENS.bg2,
  color: TOKENS.text,
  fontSize: 15,
  marginBottom: 10,
};

// Показывается вместо обычного экрана после перехода по ссылке из письма
// "восстановить пароль" — Supabase уже открыл сессию на её основе, здесь
// только просим задать новый пароль и продолжаем в приложение как обычно.
export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      onDone();
    } catch (err) {
      setError(err.message || "Не получилось сохранить пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: TOKENS.surfaceLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        <ShieldCheck size={26} color={TOKENS.gold} />
      </div>
      <h3 className="quest-heading" style={{ fontSize: 19, margin: "0 0 8px" }}>
        Новый пароль
      </h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 20px" }}>
        Придумай новый пароль для входа.
      </p>

      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Новый пароль"
          autoComplete="new-password"
          style={inputStyle}
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Повтори пароль"
          autoComplete="new-password"
          style={inputStyle}
        />
        {error && <p style={{ color: TOKENS.coral, fontSize: 13, marginBottom: 10 }}>{error}</p>}
        <button
          type="submit"
          className="quest-btn"
          disabled={loading}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Секунду…" : "Сохранить и продолжить"}
        </button>
      </form>
    </div>
  );
}
