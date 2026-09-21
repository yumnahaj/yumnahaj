import { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  CircleAlert,
  MapPin,
  Minus,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../state/AppState';
import { PageHead } from '../components/Layout';
import { Badge, Bar, Card, DemoBadge, Note, Ring, StatusBadge } from '../components/ui';
import type { SkillStatus } from '../types';

const TABS: { id: SkillStatus; label: string }[] = [
  { id: 'matched', label: 'متطابق' },
  { id: 'partial', label: 'جزئي' },
  { id: 'gap', label: 'يحتاج تطوير' },
];

export function Report() {
  const { result, input, navigate } = useApp();
  const [tab, setTab] = useState<SkillStatus>('matched');
  if (!result || !input) return null;

  const { opportunity } = input;
  const visible = result.skills.filter((skill) => skill.status === tab);
  const ringTone = result.score >= 80 ? 'success' : result.score >= 65 ? 'blue' : 'warn';

  return (
    <>
      <PageHead
        title="تقرير التطابق"
        lede="تفصيل كامل لدرجة تطابقك مع هذه الفرصة، وسبب كل نقطة."
        badge={opportunity.isDemo ? <DemoBadge /> : null}
        action={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('gaps')}>
            فجوة المهارات
            <ArrowLeft size={15} />
          </button>
        }
      />

      <Card className="fade-up" >
        <div style={{ display: 'flex', gap: 26, alignItems: 'center', flexWrap: 'wrap' }}>
          <Ring value={result.score} size={168} large tone={ringTone} />

          <div style={{ flex: 1, minWidth: 250 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 21 }}>{opportunity.title || 'فرصة التدريب'}</h2>
              {opportunity.isDemo ? <DemoBadge /> : null}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                color: 'var(--ink-soft)',
                fontSize: 13.5,
                marginTop: 8,
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={15} />
                {opportunity.org || 'جهة غير محددة'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={15} />
                {opportunity.city || 'المدينة غير محددة'}
              </span>
              {opportunity.url ? (
                <a href={opportunity.url} target="_blank" rel="noreferrer noopener">
                  رابط الإعلان
                </a>
              ) : null}
            </div>

            <div style={{ marginTop: 14 }}>
              <Badge tone={result.score >= 65 ? 'success' : 'warn'} icon={<TrendingUp size={13} />}>
                {result.band.label}
              </Badge>
              <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.85 }}>{result.band.message}</p>
            </div>
          </div>
        </div>
      </Card>

      {result.warnings.length > 0 ? (
        <div className="stack" style={{ marginTop: 16 }}>
          {result.warnings.map((warning) => (
            <Note key={warning.id} tone="warn" title={warning.title}>
              {warning.body}
            </Note>
          ))}
        </div>
      ) : null}

      <div className="split" style={{ marginTop: 16 }}>
        <Card title="لماذا حصلت على هذه النتيجة؟" sub="كل سطر مبني على مقارنة نص سيرتك بنص الإعلان.">
          <ul className="reason-list">
            {result.strengths.map((line) => (
              <li key={line}>
                <Check size={16} style={{ color: 'var(--success)' }} />
                {line}
              </li>
            ))}
            {result.weaknesses.map((line) => (
              <li key={line}>
                <CircleAlert size={16} style={{ color: 'var(--danger)' }} />
                {line}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="المهارات حسب الحالة"
          sub={`${result.skills.length} مهارة مستخرجة من الإعلان`}
          action={
            <div className="tabs" role="tablist" aria-label="تصفية المهارات حسب الحالة">
              {TABS.map((item) => {
                const count = result.skills.filter((skill) => skill.status === item.id).length;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    className="tab"
                    aria-selected={tab === item.id}
                    onClick={() => setTab(item.id)}
                  >
                    {item.id === 'matched' ? (
                      <Check size={14} />
                    ) : item.id === 'partial' ? (
                      <Minus size={14} />
                    ) : (
                      <CircleAlert size={14} />
                    )}
                    {item.label} ({count})
                  </button>
                );
              })}
            </div>
          }
        >
          {visible.length === 0 ? (
            <p className="card-sub">لا توجد مهارات في هذه الحالة.</p>
          ) : (
            <div className="stack-sm">
              {visible.map((skill) => (
                <div
                  key={skill.id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 13px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>
                      {skill.label}{' '}
                      <span style={{ fontWeight: 400, color: 'var(--ink-soft)', fontSize: 12.5 }}>
                        ({skill.group === 'core' ? 'أساسية' : 'مفضلة'})
                      </span>
                    </span>
                    <StatusBadge status={skill.status} label={skill.statusLabel} />
                  </div>
                  <div className="bar-row" style={{ marginTop: 9 }}>
                    <span>لديك {skill.current}٪</span>
                    <Bar
                      value={skill.current}
                      tone={skill.status === 'matched' ? 'success' : skill.status === 'partial' ? 'warn' : 'danger'}
                      label={`${skill.label} المستوى الحالي`}
                    />
                    <span>من {skill.required}٪</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 7, lineHeight: 1.7 }}>
                    {skill.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <details className="calc" style={{ marginTop: 16 }}>
        <summary>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
            <Calculator size={17} style={{ color: 'var(--blue)' }} />
            كيف حسبنا النتيجة؟
          </span>
          <ChevronDown size={18} style={{ color: 'var(--ink-soft)' }} />
        </summary>

        <div className="calc-body">
          {result.components.map((component) => (
            <div className="calc-row" key={component.key}>
              <span className="name">{component.label}</span>
              <span className="weight">
                {Math.round(component.weight * component.achieved)} من {component.weight}٪
              </span>
              <span style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <Bar value={component.achieved * 100} tone="blue" label={component.label} />
              </span>
              <span className="calc-note">{component.note}</span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              fontSize: 15.5,
              paddingTop: 12,
              borderTop: '1px solid var(--line)',
            }}
          >
            <span>المجموع</span>
            <span style={{ color: 'var(--blue-strong)' }}>{result.score}٪</span>
          </div>

          {result.isDemo ? (
            <Note tone="muted">
              في السيناريو التجريبي تُستخدم مستويات مهارات مُقدَّرة مسبقًا لتثبيت أرقام العرض. أما عند
              إدخال بياناتك الحقيقية فتُحسب المستويات من نص سيرتك مباشرة.
            </Note>
          ) : null}

          <Note tone="warn">
            هذه الدرجة تقديرية لمساعدتك على الاستعداد، وليست قرار توظيف أو ضمان قبول.
          </Note>
        </div>
      </details>

      <div className="btn-row no-print" style={{ marginTop: 18 }}>
        <button type="button" className="btn btn-primary" onClick={() => navigate('plan')}>
          انتقل إلى خطة الاستعداد
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('resume')}>
          تحسين السيرة
        </button>
      </div>
    </>
  );
}
