import { useState, type ReactNode } from 'react';
import {
  CalendarCheck,
  FileText,
  Gauge,
  LayoutDashboard,
  Lock,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../state/AppState';
import { Brand } from './ui';
import type { RouteId } from '../types';

interface NavItem {
  id: RouteId;
  label: string;
  short: string;
  icon: typeof Gauge;
}

const MAIN_NAV: NavItem[] = [
  { id: 'dashboard', label: 'الرئيسية', short: 'الرئيسية', icon: LayoutDashboard },
  { id: 'report', label: 'تقرير التطابق', short: 'التقرير', icon: Gauge },
  { id: 'gaps', label: 'فجوة المهارات', short: 'المهارات', icon: ScanSearch },
  { id: 'plan', label: 'خطة الاستعداد', short: 'الخطة', icon: CalendarCheck },
  { id: 'resume', label: 'تحسين السيرة', short: 'السيرة', icon: FileText },
];

function ResetDialog({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2 id="reset-title" style={{ fontSize: 19 }}>
              إعادة ضبط البيانات
            </h2>
            <p className="card-sub">
              سيُحذف التحليل والخطة وتقدّم المهام من هذا المتصفح نهائيًا. لا يمكن التراجع.
            </p>
          </div>
        </div>
        <div className="btn-row" style={{ justifyContent: 'flex-start' }}>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            <RotateCcw size={16} />
            نعم، احذف بياناتي
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            تراجع
          </button>
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { route, navigate, session, resetAll } = useApp();
  const [askReset, setAskReset] = useState(false);
  const locked = !session;

  const go = (id: RouteId) => {
    if (locked) return;
    navigate(id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <div className="shell with-sidebar">
      <a className="skip-link" href="#main">
        تخطَّ إلى المحتوى
      </a>

      <aside className="sidebar">
        <Brand />

        <nav aria-label="التنقل الرئيسي">
          <p className="nav-group-label">رحلتك</p>
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className="nav-link"
                aria-current={route === item.id ? 'page' : undefined}
                disabled={locked}
                onClick={() => go(item.id)}
              >
                <Icon size={17} />
                {item.label}
                {locked ? <Lock className="lock" size={13} aria-hidden="true" /> : null}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <button
            type="button"
            className="nav-link"
            aria-current={route === 'privacy' ? 'page' : undefined}
            onClick={() => navigate('privacy')}
          >
            <ShieldCheck size={17} />
            الخصوصية
          </button>
          <button type="button" className="nav-link" onClick={() => setAskReset(true)}>
            <RotateCcw size={17} />
            إعادة ضبط البيانات
          </button>
          <p className="sidebar-note">
            نموذج أولي تجريبي. البيانات تُحفظ في متصفحك فقط ولا تُرسل إلى أي خادم.
          </p>
        </div>
      </aside>

      <main className="shell-main" id="main">
        <div className="mobile-head">
          <Brand onLight size={34} />
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate('privacy')}
            aria-label="الخصوصية"
          >
            <ShieldCheck size={17} />
          </button>
        </div>
        <div className="content">{children}</div>
      </main>

      <nav className="bottom-nav" aria-label="التنقل السريع">
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={route === item.id ? 'page' : undefined}
              disabled={locked}
              onClick={() => go(item.id)}
            >
              <Icon size={19} />
              {item.short}
            </button>
          );
        })}
      </nav>

      {askReset ? (
        <ResetDialog
          onClose={() => setAskReset(false)}
          onConfirm={() => {
            setAskReset(false);
            resetAll();
          }}
        />
      ) : null}
    </div>
  );
}

export function PageHead({
  title,
  lede,
  action,
  badge,
}: {
  title: string;
  lede?: string;
  action?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1>{title}</h1>
          {badge}
        </div>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function SparkTitle({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      <Sparkles size={16} style={{ color: 'var(--blue)' }} />
      {children}
    </span>
  );
}
