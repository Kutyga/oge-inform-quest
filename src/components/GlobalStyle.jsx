export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
      * { box-sizing: border-box; }
      html, body, #root { margin: 0; padding: 0; min-height: 100%; }
      body { background: #14101f; }
      .quest-heading { font-family: 'Fredoka', sans-serif; }
      .quest-btn { font-family: 'Fredoka', sans-serif; border: none; cursor: pointer; transition: transform 0.12s ease; }
      .quest-btn:active { transform: scale(0.97); }
      .quest-btn:disabled { cursor: not-allowed; opacity: 0.5; }
      .quest-option { transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease; }
      .quest-option:hover:not(:disabled) { transform: translateX(2px); }
      @keyframes questPop { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      .quest-pop { animation: questPop 0.25s ease; }
      @keyframes questShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
      .quest-shake { animation: questShake 0.3s ease; }
      @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(340px) rotate(420deg); opacity: 0; } }

      /* Адаптив: на телефоне приложение на весь экран, на планшете/десктопе — карточка по центру */
      .quest-app-shell { width: 100%; }
      @media (min-width: 640px) {
        .quest-app-shell {
          max-width: 560px;
          margin: 32px auto;
          min-height: calc(100vh - 64px);
          border-radius: 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }
      }
      @media (min-width: 900px) {
        .quest-app-shell { margin: 40px auto; }
      }
    `}</style>
  );
}
