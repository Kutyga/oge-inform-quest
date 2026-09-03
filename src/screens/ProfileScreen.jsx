import { useState } from "react";
import { Check, Flame, LogOut, Pencil, ShieldCheck, Sparkles, Star, Target, TrendingUp, Trophy, User, Volume2, VolumeX } from "lucide-react";
import { TOKENS } from "../theme.js";
import { AVATARS } from "../data/avatars.js";
import { ACHIEVEMENTS } from "../data/achievements.js";
import BackRow from "../components/BackRow.jsx";
import StatCard from "../components/StatCard.jsx";

export default function ProfileScreen({ progress, nameDraft, setNameDraft, onSaveName, onPickAvatar, soundOn, onToggleSound, onReset, onBack, email, isAdmin, onOpenAdmin, onOpenAdminStats, onLogout, onOpenStats }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const CurrentAvatar = AVATARS.find((a) => a.id === progress.profile.avatar)?.Icon || User;
  const completedTopics = Object.values(progress.topics).filter((t) => t.stars > 0).length;
  const totalStars = Object.values(progress.topics).reduce((s, t) => s + (t.stars || 0), 0);

  return (
    <div style={{ padding: "8px 20px 0" }}>
      <BackRow onBack={onBack} label="Карта тем" />
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0 20px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: TOKENS.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CurrentAvatar size={28} color={TOKENS.gold} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={onSaveName}
              onKeyDown={(e) => e.key === "Enter" && onSaveName()}
              style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${TOKENS.border}`, color: TOKENS.text, fontSize: 18, fontFamily: "'Fredoka', sans-serif", padding: "4px 0" }}
            />
            <Pencil size={14} color={TOKENS.textMuted} style={{ alignSelf: "center" }} />
          </div>
          <div style={{ fontSize: 12, color: TOKENS.textMuted, marginTop: 4 }}>
            {email}
            {isAdmin ? " · администратор" : ""}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {AVATARS.map((a) => {
          const Icon = a.Icon;
          const active = progress.profile.avatar === a.id;
          return (
            <button
              key={a.id}
              className="quest-btn"
              onClick={() => onPickAvatar(a.id)}
              aria-label={`Выбрать аватар ${a.id}`}
              style={{ width: 40, height: 40, borderRadius: "50%", background: active ? TOKENS.gold : TOKENS.surfaceLight, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Icon size={18} color={active ? "#3D2A02" : TOKENS.textMuted} />
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <StatCard icon={Sparkles} label="Всего XP" value={progress.xp} />
        <StatCard icon={Flame} label="Серия дней" value={progress.streak.count} />
        <StatCard icon={Trophy} label="Тем со звёздами" value={completedTopics} />
        <StatCard icon={Star} label="Всего звёзд" value={totalStars} />
      </div>

      <div className="quest-heading" style={{ fontSize: 15, marginBottom: 10 }}>Достижения</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {ACHIEVEMENTS.map((a) => {
          const unlocked = progress.achievements.includes(a.id);
          const Icon = a.icon;
          return (
            <div
              key={a.id}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: unlocked ? TOKENS.surface : "transparent", border: `1px solid ${unlocked ? TOKENS.gold : TOKENS.border}`, opacity: unlocked ? 1 : 0.5 }}
            >
              <Icon size={18} color={unlocked ? TOKENS.gold : TOKENS.textMuted} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: TOKENS.textMuted }}>{a.desc}</div>
              </div>
              {unlocked && <Check size={16} color={TOKENS.mint} />}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: `1px solid ${TOKENS.border}` }}>
        <span style={{ fontSize: 14 }}>Звуковые эффекты</span>
        <button
          className="quest-btn"
          onClick={onToggleSound}
          style={{ background: soundOn ? TOKENS.gold : TOKENS.surfaceLight, color: soundOn ? "#3D2A02" : TOKENS.textMuted, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}
        >
          {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {soundOn ? "Включены" : "Выключены"}
        </button>
      </div>

      <button
        className="quest-btn"
        onClick={onOpenStats}
        style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, color: TOKENS.text, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <Target size={16} color={TOKENS.gold} /> Статистика ошибок
      </button>

      {isAdmin && (
        <button
          className="quest-btn"
          onClick={onOpenAdmin}
          style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, color: TOKENS.text, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <ShieldCheck size={16} color={TOKENS.gold} /> Панель администратора
        </button>
      )}
      {isAdmin && (
        <button
          className="quest-btn"
          onClick={onOpenAdminStats}
          style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12, background: TOKENS.surface, border: `1px solid ${TOKENS.border}`, color: TOKENS.text, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <TrendingUp size={16} color={TOKENS.gold} /> Статистика по пользователям
        </button>
      )}

      <button
        className="quest-btn"
        onClick={onLogout}
        style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${TOKENS.border}`, color: TOKENS.textMuted, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <LogOut size={16} color={TOKENS.textMuted} /> Выйти из аккаунта
      </button>

      <div style={{ marginTop: 20, paddingBottom: 10 }}>
        {!confirmReset ? (
          <button className="quest-btn" onClick={() => setConfirmReset(true)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "transparent", border: `1px solid ${TOKENS.coral}`, color: TOKENS.coral, fontSize: 14 }}>
            Сбросить весь прогресс
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button className="quest-btn" onClick={onReset} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: TOKENS.coral, color: "#3D0F0A", fontWeight: 700, fontSize: 14 }}>
              Да, сбросить
            </button>
            <button className="quest-btn" onClick={() => setConfirmReset(false)} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: TOKENS.surfaceLight, color: TOKENS.text, fontSize: 14 }}>
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
