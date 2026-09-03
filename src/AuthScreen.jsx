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

function friendlyError(message) {
  if (/invalid login credentials/i.test(message)) return "Неверный e-mail или пароль";
  if (/user already registered/i.test(message)) return "Такой e-mail уже зарегистрирован";
  if (/password should be at least/i.test(message)) return "Пароль слишком короткий (минимум 6 символов)";
  return message;
}

function InfoScreen({ title, text, buttonLabel, onButtonClick }) {
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
        <ShieldCheck size={26} color={TOKENS.mint} />
      </div>
      <h3 className="quest-heading" style={{ fontSize: 19, margin: "0 0 8px" }}>
        {title}
      </h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 20px" }}>{text}</p>
      <button
        className="quest-btn"
        onClick={onButtonClick}
        style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15 }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function switchMode(next) {
    setError("");
    setMode(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Заполни e-mail");
      return;
    }
    if (mode !== "forgot" && !password.trim()) {
      setError("Заполни пароль");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      } else if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() || "Игрок" } },
        });
        if (err) throw err;
        if (data.user && !data.session) {
          setCheckEmail(true);
        }
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });
        if (err) throw err;
        setResetSent(true);
      }
    } catch (err) {
      setError(friendlyError(err.message || "Что-то пошло не так"));
    } finally {
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <InfoScreen
        title="Проверь почту"
        text={`Мы отправили письмо на ${email}. Перейди по ссылке в письме, чтобы подтвердить регистрацию, и вернись сюда войти.`}
        buttonLabel="К входу"
        onButtonClick={() => {
          setCheckEmail(false);
          switchMode("login");
        }}
      />
    );
  }

  if (resetSent) {
    return (
      <InfoScreen
        title="Проверь почту"
        text={`Мы отправили на ${email} ссылку для сброса пароля. Перейди по ней и задай новый пароль.`}
        buttonLabel="К входу"
        onButtonClick={() => {
          setResetSent(false);
          switchMode("login");
        }}
      />
    );
  }

  const titles = { login: "Вход в Инфо-квест ОГЭ", register: "Регистрация", forgot: "Восстановление пароля" };
  const subtitles = {
    login: "Войди, чтобы продолжить с того же места на любом устройстве.",
    register: "Прогресс будет привязан к твоему аккаунту.",
    forgot: "Укажи e-mail — пришлём ссылку для сброса пароля.",
  };

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
        {titles[mode]}
      </h3>
      <p style={{ color: TOKENS.textMuted, fontSize: 13, margin: "0 0 20px" }}>{subtitles[mode]}</p>

      <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
        {mode === "register" && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Имя"
            style={inputStyle}
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          autoComplete="email"
          style={inputStyle}
        />
        {mode !== "forgot" && (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            style={inputStyle}
          />
        )}
        {error && <p style={{ color: TOKENS.coral, fontSize: 13, marginBottom: 10 }}>{error}</p>}
        <button
          type="submit"
          className="quest-btn"
          disabled={loading}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: TOKENS.gold, color: "#3D2A02", fontWeight: 700, fontSize: 15, marginBottom: 10, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Секунду…" : mode === "login" ? "Войти" : mode === "register" ? "Зарегистрироваться" : "Отправить ссылку"}
        </button>
      </form>

      {mode === "login" && (
        <button
          className="quest-btn"
          onClick={() => switchMode("forgot")}
          style={{ width: "100%", padding: "6px 16px", background: "transparent", color: TOKENS.textMuted, fontSize: 12, marginBottom: 4 }}
        >
          Забыли пароль?
        </button>
      )}

      <button
        className="quest-btn"
        onClick={() => switchMode(mode === "login" ? "register" : "login")}
        style={{ width: "100%", padding: "10px 16px", background: "transparent", color: TOKENS.textMuted, fontSize: 13 }}
      >
        {mode === "register" ? "Уже есть аккаунт? Войти" : mode === "forgot" ? "Вспомнил пароль? Войти" : "Нет аккаунта? Зарегистрироваться"}
      </button>
    </div>
  );
}
