import {
  ArrowLeft,
  Briefcase,
  CalendarCheck,
  Check,
  CircleAlert,
  Gauge,
  Minus,
  Play,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../state/AppState';
import { PageHead } from '../components/Layout';
import { Badge, Bar, Card, DemoBadge, Note, Ring, Stat, StatusBadge } from '../components/ui';
import { formatMinutes, firstName, voiced } from '../lib/utils';
import type { SkillFinding } from '../types';

export function Dashboard() {
  const { result, input, navigate, stats, weeks, taskState, setTaskState, allTasks } = useApp();
  if (!result || !input) return null;

  const { student, opportunity } = input;
  const name = firstName(student.name) || 'بك';
  const topGap = result.skills.find((skill) => skill.id === result.topGapId);
  const matched = result.skills.filter((skill) => skill.status === 'matched');
  const partial = result.skills.filter((skill) => skill.status === 'partial');
  const gaps = result.skills.filter((skill) => skill.status === 'gap');

  const firstWeek = weeks[0];
  const nextTask = allTasks.find((task) => taskState(task.id) !== 'done');
  const weekRemaining = firstWeek
    ? firstWeek.tasks
        .filter((task) => taskState(task.id) !== 'done')
        .reduce((sum, task) => sum + task.minutes, 0)
    : 0;
  const weekTotal = firstWeek ? firstWeek.tasks.reduce((sum, task) => sum + task.minutes, 0) : 0;
  const weekDone = weekTotal === 0 ? 0 : Math.round(((weekTotal - weekRemaining) / weekTotal) * 100);

  const ringTone = result.score >= 80 ? 'success' : result.score >= 65 ? 'blue' : 'warn';

  return (
    <>
      <PageHead
        title={`أهلًا ${name}، ${voiced(student, 'أنتِ أقرب مما تتوقعين', 'أنت أقرب مما تتوقع')}`}
        lede={`هذه خلاصة جاهزيتك لفرصة ${opportunity.title || 'التدريب المستهدفة'}.`}
        badge={opportunity.isDemo ? <DemoBadge /> : null}
        action={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('wizard')}>
            تحليل فرصة أخرى
          </button>
        }
      />

      {result.warnings.length > 0 ? (
        <div className="stack" style={{ marginBottom: 16 }}>
          {result.warnings.map((warning) => (
            <Note key={warning.id} tone="warn" title={warning.title}>
              {warning.body}
            </Note>
          ))}
        </div>
      ) : null}

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat
          icon={<Briefcase size={15} />}
          label="فرصة التدريب المستهدفة"
          value={opportunity.title || '—'}
          small
          foot={`${opportunity.org || 'جهة غير محددة'} — ${opportunity.city || 'المدينة غير محددة'}`}
        />
        <Stat
          icon={<Gauge size={15} />}
          label="درجة التطابق"
          value={`${result.score}٪`}
          bar={{ value: result.score, tone: result.score >= 65 ? 'blue' : 'warn' }}
          foot={result.band.label}
        />
        <Stat
          icon={<Target size={15} />}
          label="أهم فجوة"
          value={topGap?.label ?? 'لا توجد فجوة'}
          small
          foot={
            topGap
              ? `المستوى الحالي ${topGap.current}٪ من ${topGap.required}٪ المطلوبة`
              : 'جميع المهارات بلغت المستوى المطلوب'
          }
        />
        <Stat
          icon={<CalendarCheck size={15} />}
          label="تقدم خطة الاستعداد"
          value={`${stats.progress}٪`}
          bar={{ value: stats.progress, tone: 'success' }}
          foot={`${stats.doneTasks} من ${stats.totalTasks} مهمة مكتملة`}
        />
      </div>

      <div className="split" style={{ marginBottom: 16 }}>
        <Card>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            <Ring value={result.score} size={148} tone={ringTone} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                <h2 className="card-title">درجة التطابق</h2>
                <Badge tone={result.score >= 65 ? 'success' : 'warn'} icon={<TrendingUp size={13} />}>
                  {result.band.label}
                </Badge>
              </div>
              <p style={{ marginTop: 9, color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.8 }}>
                {result.band.message}
              </p>
              <div className="btn-row" style={{ marginTop: 16 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('report')}>
                  عرض التقرير الكامل
                  <ArrowLeft size={15} />
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('gaps')}>
                  فجوة المهارات
                </button>
              </div>
            </div>
          </div>
        </Card>

        <div className="next-step">
          <span className="eyebrow">
            <Target size={14} />
            أفضل خطوة لك الآن
          </span>
          <h3>
            {topGap
              ? `أكمل أساسيات ${topGap.label} وابنِ لوحة معلومات صغيرة`
              : (nextTask?.title ?? 'راجع خطتك وابدأ أول مهمة')}
          </h3>
          <div className="meta">
            <Badge tone="neutral">الوقت المتوقع: {weekRemaining || weekTotal} دقيقة</Badge>
            <Badge tone="neutral">الأولوية: عالية</Badge>
            <Badge tone="neutral">
              الأسبوع الأول: {weekDone}٪
            </Badge>
          </div>
          <p style={{ fontSize: 13.5, color: '#b7c4dc', lineHeight: 1.8 }}>
            {nextTask ? nextTask.title : 'أنهيت كل مهام الخطة. راجع سيرتك ثم أرسل الطلب.'}
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!nextTask}
              onClick={() => {
                if (nextTask) setTaskState(nextTask.id, 'doing');
                navigate('plan');
              }}
            >
              <Play size={15} />
              ابدأ المهمة
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('plan')}>
              عرض الخطة
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <SkillColumn
          title="المهارات المتطابقة"
          tone="success"
          icon={<Check size={15} />}
          skills={matched}
          empty="لا توجد مهارة بلغت المستوى المطلوب بعد."
        />
        <SkillColumn
          title="المهارات الجزئية"
          tone="warn"
          icon={<Minus size={15} />}
          skills={partial}
          empty="لا توجد مهارات جزئية."
        />
        <SkillColumn
          title="المهارات الناقصة"
          tone="danger"
          icon={<CircleAlert size={15} />}
          skills={gaps}
          empty="لا توجد فجوات. أنت جاهز للتقديم."
        />
      </div>

      <Card
        title="تقدم الأسبوع الحالي"
        sub={firstWeek ? `الأسبوع ${firstWeek.index}: ${firstWeek.title}` : undefined}
        action={
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('plan')}>
            كل المهام
          </button>
        }
      >
        <div className="stack-sm" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--ink-soft)' }}>
              أنجزت {formatMinutes(weekTotal - weekRemaining)} من {formatMinutes(weekTotal)}
            </span>
            <span style={{ fontWeight: 700 }}>{weekDone}٪</span>
          </div>
          <Bar value={weekDone} tone="success" label="تقدم الأسبوع الأول" />
        </div>

        <div className="stack-sm">
          {firstWeek?.tasks.map((task) => {
            const state = taskState(task.id);
            return (
              <div key={task.id} className="mini-skill">
                <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Badge
                    tone={state === 'done' ? 'success' : state === 'doing' ? 'warn' : 'neutral'}
                    icon={state === 'done' ? <Check size={12} /> : undefined}
                  >
                    {state === 'done' ? 'مكتملة' : state === 'doing' ? 'جارية' : 'لم تبدأ'}
                  </Badge>
                  <span style={{ color: state === 'done' ? 'var(--ink-soft)' : undefined }}>{task.title}</span>
                </span>
                <span style={{ color: 'var(--ink-soft)', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                  {task.minutes} د
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}

function SkillColumn({
  title,
  tone,
  icon,
  skills,
  empty,
}: {
  title: string;
  tone: 'success' | 'warn' | 'danger';
  icon: React.ReactNode;
  skills: SkillFinding[];
  empty: string;
}) {
  return (
    <Card
      title={title}
      action={
        <Badge tone={tone} icon={icon}>
          {skills.length}
        </Badge>
      }
    >
      {skills.length === 0 ? (
        <p className="card-sub">{empty}</p>
      ) : (
        <div className="stack-sm">
          {skills.map((skill) => (
            <div key={skill.id} className="mini-skill">
              <span style={{ fontWeight: 600 }}>{skill.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ color: 'var(--ink-soft)', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                  {skill.current}٪ من {skill.required}٪
                </span>
                <StatusBadge status={skill.status} label={skill.statusLabel} />
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
