import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useApp } from '../state/AppState';
import { Bar, Brand } from '../components/ui';

const PHASES = [
  'قراءة ملف الطالب',
  'استخراج متطلبات الفرصة',
  'مقارنة المهارات والأدلة',
  'إنشاء خطة الاستعداد',
];

const STEP_MS = 520;

export function Analyzing() {
  const { finishAnalysis } = useApp();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const interval = reduced ? 140 : STEP_MS;
    const timers: number[] = [];

    for (let index = 1; index <= PHASES.length; index += 1) {
      timers.push(window.setTimeout(() => setPhase(index), interval * index));
    }
    timers.push(window.setTimeout(finishAnalysis, interval * (PHASES.length + 0.8)));

    return () => timers.forEach(window.clearTimeout);
  }, [finishAnalysis]);

  const progress = Math.round((phase / PHASES.length) * 100);

  return (
    <div className="analyzing">
      <div className="analyzing-card fade-up">
        <Brand onLight />

        <div style={{ margin: '24px 0 18px' }}>
          <h1 style={{ fontSize: 20 }}>نحلّل ملفك الآن</h1>
          <p className="card-sub">
            كل الحسابات تجري داخل متصفحك. لا تُرسل بياناتك إلى أي خادم.
          </p>
        </div>

        <Bar value={progress} label="تقدم التحليل" />
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 8, textAlign: 'end' }}>
          {progress}٪
        </p>

        <div style={{ marginTop: 14 }}>
          {PHASES.map((label, index) => {
            const done = index < phase;
            const active = index === phase;
            return (
              <div key={label} className={`phase ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                <span className="dot">
                  {done ? (
                    <Check size={15} strokeWidth={3} />
                  ) : active ? (
                    <Loader2 size={15} className="spin" />
                  ) : (
                    <span style={{ fontSize: 11 }}>{index + 1}</span>
                  )}
                </span>
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
