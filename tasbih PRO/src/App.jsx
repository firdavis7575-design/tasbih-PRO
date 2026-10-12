import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "fozil-tasbih-v1";

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      count: Number.isFinite(saved.count) ? saved.count : 0,
      target: [33, 99, 100, 1000].includes(saved.target) ? saved.target : 33,
      total: Number.isFinite(saved.total) ? saved.total : 0,
      sound: saved.sound !== false,
    };
  } catch {
    return { count: 0, target: 33, total: 0, sound: true };
  }
}

export default function App() {
  const [saved, setSaved] = useState(loadSaved);
  const { count, target, total, sound } = saved;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved]);

  function tapTasbih() {
    setSaved((old) => ({
      ...old,
      count: old.count + 1,
      total: old.total + 1,
    }));

    if (sound && "vibrate" in navigator) navigator.vibrate(18);

    if (sound) {
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = 720;
          gain.gain.setValueAtTime(0.035, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.07);
          oscillator.onended = () => ctx.close();
        }
      } catch {}
    }
  }

  function resetCount() {
    if (
      count === 0 ||
      window.confirm("Joriy tasbih hisobini nolga tushiraymi?")
    ) {
      setSaved((old) => ({ ...old, count: 0 }));
    }
  }

  const progress = Math.min((count / target) * 100, 100);
  const completed = count > 0 && count % target === 0;

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#home" aria-label="Tasbih bosh sahifa">
          <span className="brand-mark">۞</span>
          <span>
            TASBIH<span className="brand-dot">.</span>
          </span>
        </a>
        <button
          className={`sound-toggle ${sound ? "is-on" : ""}`}
          onClick={() => setSaved((old) => ({ ...old, sound: !old.sound }))}
          aria-label="Ovoz va vibratsiyani yoqish yoki o‘chirish"
          title="Ovoz va vibratsiya"
        >
          {sound ? "♫ Ovoz yoqilgan" : "♩ Ovoz o‘chiq"}
        </button>
      </header>

      <section className="hero" id="home">
        <div className="eyebrow">
          <span className="eyebrow-line" /> SOKINLIK • ZIKR • SHUKR{" "}
          <span className="eyebrow-line" />
        </div>
        <h1>
          Qalbingizni <em>zikr</em> bilan to‘ldiring.
        </h1>
        <p className="subtitle">Har bir tasbeh — xotirjamlik sari bir qadam.</p>

        <div className="counter-card">
          <div className="counter-top">
            <span className="counter-label">JORIY HISOB</span>
            <span className="target-pill">Maqsad: {target}</span>
          </div>

          <button
            className="bead-button"
            onClick={tapTasbih}
            aria-label="Tasbihni sanash"
          >
            <span className="bead-orbit orbit-a" />
            <span className="bead-orbit orbit-b" />
            <span className="bead-center">
              <span className="bead-symbol">۞</span>
              <span className="count-number">
                {count.toLocaleString("uz-UZ")}
              </span>
              <span className="tap-label">BOSISH UCHUN TEGING</span>
            </span>
          </button>

          <div className="progress-section">
            <div className="progress-copy">
              <span>MAQSADGA ERISHISH</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-foot">
              <span>
                {count >= target
                  ? "Maqsad bajarildi ✨"
                  : `${Math.max(target - count, 0)} ta qoldi`}
              </span>
              <span>
                {count} / {target}
              </span>
            </div>
          </div>

          {completed && (
            <div className="completion-note">
              ✨ Maqsadga yetdingiz! Davom etishingiz mumkin.
            </div>
          )}

          <div className="actions">
            <button className="reset-button" onClick={resetCount}>
              ↺ Hisobni tiklash
            </button>
            <div className="target-picker" aria-label="Maqsadni tanlash">
              {[33, 99, 100, 1000].map((value) => (
                <button
                  key={value}
                  className={
                    target === value
                      ? "target-option selected"
                      : "target-option"
                  }
                  onClick={() => setSaved((old) => ({ ...old, target: value }))}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <span className="stat-icon">◉</span>
            <div>
              <strong>{total.toLocaleString("uz-UZ")}</strong>
              <span>Jami bosishlar</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✧</span>
            <div>
              <strong>{count.toLocaleString("uz-UZ")}</strong>
              <span>Joriy tasbih</span>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-ornament">۞</div>
        <p>Shoshilmang. Nafas oling. Zikr qiling.</p>
        <span>FOZIL TASBIH · Hisob qurilmangizda saqlanadi</span>
      </footer>
    </main>
  );
}
