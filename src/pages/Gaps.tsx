import { useState } from 'react';
import { ArrowLeft, Check, CircleAlert, FileSearch, Lightbulb, Minus, Plus } from 'lucide-react';
import { useApp } from '../state/AppState';
import { PageHead } from '../components/Layout';
import { Badge, Bar, Card, DemoBadge, Note, Stat, StatusBadge } from '../components/ui';
import type { SkillFinding } from '../types';

type Filter = 'all' | 'matched' | 'partial' | 'high';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'matched', label: 'متطابق' },
  { id: 'partial', label: 'جزئي' },
  { id: 'high', label: 'أولوية عالية' },
];

function matches(skill: SkillFinding, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'high') return skill.status === 'gap';
  return skill.status === filter;
}

export function Gaps() {
  const { result, input, navigate, addSkillToPlan, isSkillInPlan } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  if (!result || !input) return null;

  const matched = result.skills.filter((skill) => skill.status === 'matched');
  const partial = result.skills.filter((skill) => skill.status === 'partial');
  const gaps = result.skills.filter((skill) => skill.status === 'gap');
  const visible = result.skills.filter((skill) => matches(skill, filter));

  return (
    <>
      <PageHead
        title="فجوة المهارات"
        lede="مقارنة مستواك الحالي بالمستوى الذي يطلبه الإعلان، مع الدليل الموجود في سيرتك."
        badge={input.opportunity.isDemo ? <DemoBadge /> : null}
        action={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('plan')}>
            خطة الاستعداد
            <ArrowLeft size={15} />
          </button>
        }
      />

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <Stat
          icon={<Check size={15} style={{ color: 'var(--success)' }} />}
          label="مهارات متطابقة"
          value={`${matched.length}`}
          foot={matched.map((skill) => skill.label).join('، ') || 'لا توجد'}
        />
        <Stat
          icon={<Minus size={15} style={{ color: 'var(--warn)' }} />}
          label="مهارات جزئية"
          value={`${partial.length}`}
          foot={partial.map((skill) => skill.label).join('، ') || 'لا توجد'}
        />
        <Stat
          icon={<CircleAlert size={15} style={{ color: 'var(--danger)' }} />}
          label="مهارات بأولوية عالية"
          value={`${gaps.length}`}
          foot={gaps.map((skill) => skill.label).join('، ') || 'لا توجد'}
        />
      </div>

      <div
        className="tabs no-print"
        role="tablist"
        aria-label="تصفية المهارات"
        style={{ marginBottom: 16 }}
      >
        {FILTERS.map((item) => {
          const count = result.skills.filter((skill) => matches(skill, item.id)).length;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              className="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <Card>
          <div className="empty-state">
            <span className="icon">
              <FileSearch size={22} />
            </span>
            <h2 className="card-title">لا توجد مهارات في هذا التصنيف</h2>
            <p className="card-sub">جرّب تصفية أخرى لعرض بقية المهارات.</p>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFilter('all')}>
              عرض الكل
            </button>
          </div>
        </Card>
      ) : (
        <div className="stack">
          {visible.map((skill) => {
            const inPlan = isSkillInPlan(skill.id);
            const tone =
              skill.status === 'matched' ? 'success' : skill.status === 'partial' ? 'warn' : 'danger';
            return (
              <article
                key={skill.id}
                className={`skill-card is-${skill.status}`}
              >
                <div className="head">
                  <span className="name">
                    {skill.label}
                    <Badge tone="neutral">{skill.group === 'core' ? 'أساسية' : 'مفضلة'}</Badge>
                  </span>
                  <StatusBadge status={skill.status} label={skill.statusLabel} />
                </div>

                <div className="stack-sm">
                  <div className="bar-row">
                    <span>مستواك</span>
                    <Bar value={skill.current} tone={tone} label={`${skill.label} المستوى الحالي`} />
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{skill.current}٪</span>
                  </div>
                  <div className="bar-row">
                    <span>المطلوب</span>
                    <Bar value={skill.required} tone="ghost" label={`${skill.label} المستوى المطلوب`} />
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{skill.required}٪</span>
                  </div>
                </div>

                <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.8 }}>{skill.reason}</p>

                <div className={skill.evidence ? 'evidence' : 'evidence empty'}>
                  <span className="tag">الدليل في سيرتك</span>
                  {skill.evidence ?? 'لا يوجد سطر في السيرة يدعم هذه المهارة حتى الآن.'}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 14,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                      fontSize: 13.5,
                      maxWidth: '62ch',
                      lineHeight: 1.75,
                    }}
                  >
                    <Lightbulb size={16} style={{ color: 'var(--warn)', flex: 'none', marginTop: 3 }} />
                    {skill.recommendation}
                  </span>

                  <button
                    type="button"
                    className={inPlan ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                    disabled={inPlan}
                    onClick={() => addSkillToPlan(skill)}
                  >
                    {inPlan ? <Check size={15} /> : <Plus size={15} />}
                    {inPlan ? 'مضافة إلى خطتك' : 'أضف إلى خطتي'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Note tone="muted">
          المستويات تقديرية مبنية على ورود المهارة في نص سيرتك وقوة الدليل المرافق لها، وليست اختبار
          كفاءة.
        </Note>
      </div>
    </>
  );
}
