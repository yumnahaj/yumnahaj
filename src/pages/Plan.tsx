import { useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  ListChecks,
  Printer,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useApp } from '../state/AppState';
import { PageHead } from '../components/Layout';
import { Badge, Bar, Card, DemoBadge, Note, Stat } from '../components/ui';
import { TODAY_MESSAGE } from '../data/plan';
import { formatMinutes } from '../lib/utils';
import type { PlanTask, TaskState } from '../types';

const STATE_LABEL: Record<TaskState, string> = {
  todo: 'لم تبدأ',
  doing: 'جارية',
  done: 'مكتملة',
};

const STATE_TONE: Record<TaskState, 'neutral' | 'warn' | 'success'> = {
  todo: 'neutral',
  doing: 'warn',
  done: 'success',
};

function TaskRow({ task }: { task: PlanTask }) {
  const { taskState, cycleTask } = useApp();
  const [open, setOpen] = useState(false);
  const state = taskState(task.id);

  return (
    <div className={`task ${state}`}>
      <button
        type="button"
        className="task-check"
        onClick={() => cycleTask(task.id)}
        aria-pressed={state === 'done'}
        aria-label={`${task.title} — الحالة الآن ${STATE_LABEL[state]}. اضغط لتغيير الحالة.`}
      >
        {state === 'done' ? <Check size={15} strokeWidth={3} /> : state === 'doing' ? <Clock size={14} /> : null}
      </button>

      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <Badge tone="neutral" icon={<Clock size={12} />}>
            {task.minutes} دقيقة
          </Badge>
          <Badge tone={task.priority === 'high' ? 'danger' : 'neutral'}>
            {task.priority === 'high' ? 'أولوية عالية' : 'أولوية متوسطة'}
          </Badge>
          <Badge tone={STATE_TONE[state]} icon={state === 'done' ? <Check size={12} /> : undefined}>
            {STATE_LABEL[state]}
          </Badge>
          <button
            type="button"
            className="btn btn-ghost btn-sm no-print"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
            <ChevronDown
              size={14}
              style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
            />
          </button>
        </div>
        {open ? <div className="task-detail">{task.detail}</div> : null}
      </div>
    </div>
  );
}

export function Plan() {
  const { result, input, weeks, stats, todayTasks, taskState, navigate } = useApp();
  const [tab, setTab] = useState<'full' | 'today'>('full');
  if (!result || !input) return null;

  const todayRemaining = todayTasks
    .filter((task) => taskState(task.id) !== 'done')
    .reduce((sum, task) => sum + task.minutes, 0);

  return (
    <>
      <PageHead
        title="خطة الاستعداد"
        lede={`أربعة أسابيع تنتهي بطلب جاهز للإرسال إلى ${input.opportunity.org || 'الجهة المستهدفة'}.`}
        badge={input.opportunity.isDemo ? <DemoBadge /> : null}
        action={
          <div className="btn-row no-print">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              طباعة الخطة
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('gaps')}>
              فجوة المهارات
            </button>
          </div>
        }
      />

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <Stat
          icon={<Sparkles size={15} />}
          label="نسبة الإنجاز"
          value={`${stats.progress}٪`}
          bar={{ value: stats.progress, tone: 'success' }}
          foot="محسوبة بوزن وقت المهام لا بعددها"
        />
        <Stat
          icon={<ListChecks size={15} />}
          label="المهام المكتملة"
          value={`${stats.doneTasks} من ${stats.totalTasks}`}
          foot={`${stats.totalTasks - stats.doneTasks} مهمة متبقية`}
        />
        <Stat
          icon={<Clock size={15} />}
          label="الوقت المتبقي التقديري"
          value={formatMinutes(stats.remainingMinutes)}
          foot={`من أصل ${formatMinutes(stats.totalMinutes)}`}
        />
      </div>

      <div className="tabs no-print" role="tablist" aria-label="عرض الخطة" style={{ marginBottom: 16 }}>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === 'full'}
          onClick={() => setTab('full')}
        >
          <CalendarDays size={14} />
          الخطة الكاملة
        </button>
        <button
          type="button"
          role="tab"
          className="tab"
          aria-selected={tab === 'today'}
          onClick={() => setTab('today')}
        >
          <Sun size={14} />
          مهام اليوم ({todayTasks.filter((task) => taskState(task.id) !== 'done').length})
        </button>
      </div>

      {tab === 'today' ? (
        <div className="stack">
          <div className="today-banner">
            <Sparkles size={19} />
            {TODAY_MESSAGE}
          </div>

          <Card
            title="ثلاث مهام فقط لهذا اليوم"
            sub={
              todayRemaining > 0
                ? `الوقت المتبقي اليوم: ${formatMinutes(todayRemaining)}`
                : 'أنهيت مهام اليوم. انتقل إلى الأسبوع التالي في الخطة الكاملة.'
            }
          >
            <div>
              {todayTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </Card>

          <Note tone="muted">
            نعرض ثلاث مهام فقط حتى لا تتشتت. عند إنهائها ستجد بقية الأسابيع في تبويب «الخطة الكاملة».
          </Note>
        </div>
      ) : (
        <div className="timeline">
          {weeks.map((week) => {
            const total = week.tasks.reduce((sum, task) => sum + task.minutes, 0);
            const done = week.tasks
              .filter((task) => taskState(task.id) === 'done')
              .reduce((sum, task) => sum + task.minutes, 0);
            const percent = total === 0 ? 0 : Math.round((done / total) * 100);

            return (
              <section key={week.id} className={`week ${percent === 100 ? 'complete' : ''}`}>
                <header className="week-head">
                  <span className="week-num">
                    {percent === 100 ? <Check size={17} strokeWidth={3} /> : `أسبوع ${week.index}`}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      <h3>{week.title}</h3>
                      <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                        {percent}٪ — {formatMinutes(total)}
                      </span>
                    </div>
                    <p className="goal">{week.goal}</p>
                    <div style={{ marginTop: 9 }}>
                      <Bar value={percent} tone="success" label={`تقدم الأسبوع ${week.index}`} />
                    </div>
                  </div>
                </header>

                <div>
                  {week.tasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Note tone="muted">
          المواعيد تقديرية. اضغط على المربع لتبديل حالة المهمة بين: لم تبدأ، جارية، مكتملة. يُحفظ تقدمك
          تلقائيًا في متصفحك.
        </Note>
      </div>
    </>
  );
}
