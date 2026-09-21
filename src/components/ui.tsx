import type { ReactNode } from 'react';
import { AlertTriangle, Check, CircleAlert, Info, Minus } from 'lucide-react';
import type { SkillStatus } from '../types';

/* ------------------------------------------------------------------ */
/* الشعار                                                              */
/* ------------------------------------------------------------------ */

export function BrandMark({ size = 38 }: { size?: number }) {
  const inner = Math.round(size * 0.55);
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2.5l8 4.6v9.8L12 21.5 4 16.9V7.1l8-4.6z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M8.6 15.4l3-6.4 3.8 3.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15.4" cy="12.1" r="1.7" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Brand({ onLight = false, size = 38 }: { onLight?: boolean; size?: number }) {
  return (
    <div className={onLight ? 'brand on-light' : 'brand'}>
      <BrandMark size={size} />
      <span className="brand-text">
        <span className="name">مُرشد</span>
        <span className="tagline">من سيرتك إلى تدريبك بخطة واضحة</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* حلقة النسبة                                                         */
/* ------------------------------------------------------------------ */

export function Ring({
  value,
  size = 132,
  caption = 'درجة تطابق',
  large = false,
  tone = 'blue',
}: {
  value: number;
  size?: number;
  caption?: string;
  large?: boolean;
  tone?: 'blue' | 'success' | 'warn';
}) {
  const stroke = large ? 13 : 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);
  const color = tone === 'success' ? 'var(--success)' : tone === 'warn' ? 'var(--warn)' : 'var(--blue)';

  return (
    <div
      className={large ? 'ring lg' : 'ring'}
      role="img"
      aria-label={`${caption}: ${value} بالمئة`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        <circle className="track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="ring-center">
        <span className="num">{value}٪</span>
        <span className="cap">{caption}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* شريط تقدم                                                           */
/* ------------------------------------------------------------------ */

export function Bar({
  value,
  tone = 'blue',
  label,
}: {
  value: number;
  tone?: 'blue' | 'success' | 'warn' | 'danger' | 'ghost';
  label?: string;
}) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`bar ${tone}`}
      role="progressbar"
      aria-valuenow={safe}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span style={{ width: `${safe}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* الشارات                                                             */
/* ------------------------------------------------------------------ */

type BadgeTone = 'neutral' | 'info' | 'success' | 'warn' | 'danger' | 'demo';

export function Badge({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

const STATUS_TONE: Record<SkillStatus, BadgeTone> = {
  matched: 'success',
  partial: 'warn',
  gap: 'danger',
};

/** شارة حالة المهارة: لون + أيقونة + نص، حتى لا يعتمد المعنى على اللون وحده */
export function StatusBadge({ status, label }: { status: SkillStatus; label: string }) {
  const icon =
    status === 'matched' ? (
      <Check size={13} strokeWidth={2.6} />
    ) : status === 'partial' ? (
      <Minus size={13} strokeWidth={2.6} />
    ) : (
      <CircleAlert size={13} strokeWidth={2.4} />
    );
  return (
    <Badge tone={STATUS_TONE[status]} icon={icon}>
      {label}
    </Badge>
  );
}

export function DemoBadge() {
  return <Badge tone="demo">بيانات تجريبية</Badge>;
}

/* ------------------------------------------------------------------ */
/* تنبيهات                                                             */
/* ------------------------------------------------------------------ */

export function Note({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'muted';
  title?: string;
  children: ReactNode;
}) {
  const Icon = tone === 'warn' ? AlertTriangle : Info;
  return (
    <div className={`note note-${tone}`}>
      <Icon size={17} />
      <span>
        {title ? <strong>{title}</strong> : null}
        {children}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* بطاقة إحصائية                                                       */
/* ------------------------------------------------------------------ */

export function Stat({
  icon,
  label,
  value,
  small = false,
  foot,
  bar,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  small?: boolean;
  foot?: ReactNode;
  bar?: { value: number; tone?: 'blue' | 'success' | 'warn' | 'danger' };
}) {
  return (
    <div className="stat">
      <span className="stat-label">
        {icon}
        {label}
      </span>
      <span className={small ? 'stat-value sm' : 'stat-value'}>{value}</span>
      {bar ? <Bar value={bar.value} tone={bar.tone} label={label} /> : null}
      {foot ? <span className="stat-foot">{foot}</span> : null}
    </div>
  );
}

export function Card({
  title,
  sub,
  action,
  children,
  className = '',
}: {
  title?: string;
  sub?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card card-pad ${className}`}>
      {title ? (
        <header className="card-head">
          <div>
            <h2 className="card-title">{title}</h2>
            {sub ? <p className="card-sub">{sub}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}
