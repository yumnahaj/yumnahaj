import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Briefcase,
  CircleAlert,
  ClipboardPaste,
  FileText,
  GraduationCap,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { useApp } from '../state/AppState';
import { Badge, Card, Note } from '../components/ui';
import { PageHead } from '../components/Layout';
import { CITY_OPTIONS, DEGREE_OPTIONS, SKILL_LIBRARY, TARGET_FIELDS } from '../data/skills';
import { DEMO_INPUT, DEMO_OPPORTUNITY_TEXT, EMPTY_INPUT } from '../data/demo';
import { normalize } from '../lib/analyze';
import type { AnalysisInput } from '../types';

const STEPS = [
  { title: 'بيانات الطالب', icon: GraduationCap },
  { title: 'السيرة الذاتية', icon: FileText },
  { title: 'فرصة التدريب', icon: Briefcase },
  { title: 'المراجعة', icon: Sparkles },
];

type Errors = Record<string, string>;

function extractSkillLabels(text: string): string[] {
  if (!text.trim()) return [];
  const normalized = normalize(text);
  return SKILL_LIBRARY.filter((skill) =>
    skill.aliases.some((alias) => normalized.includes(normalize(alias))),
  ).map((skill) => skill.label);
}

function extractRequirementLines(text: string): string[] {
  return text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter((line) => /^([-–—*•·]|\d+[.)])\s*/.test(line))
    .map((line) => line.replace(/^([-–—*•·]|\d+[.)])\s*/, ''))
    .slice(0, 8);
}

export function Wizard() {
  const { navigate, runAnalysis } = useApp();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [draft, setDraft] = useState<AnalysisInput>(() => structuredClone(EMPTY_INPUT));
  const fileRef = useRef<HTMLInputElement>(null);

  const skills = useMemo(() => extractSkillLabels(draft.resume.text), [draft.resume.text]);
  const requirements = useMemo(
    () => extractRequirementLines(draft.opportunity.description),
    [draft.opportunity.description],
  );

  const setStudent = (patch: Partial<AnalysisInput['student']>) =>
    setDraft((current) => ({ ...current, student: { ...current.student, ...patch } }));
  const setOpportunity = (patch: Partial<AnalysisInput['opportunity']>) =>
    setDraft((current) => ({ ...current, opportunity: { ...current.opportunity, ...patch } }));
  const setResume = (patch: Partial<AnalysisInput['resume']>) =>
    setDraft((current) => ({ ...current, resume: { ...current.resume, ...patch } }));

  function validate(target: number): boolean {
    const next: Errors = {};
    if (target > 0) {
      if (!draft.student.name.trim()) next.name = 'اكتب اسمك الأول حتى نخاطبك به.';
      if (!draft.student.major.trim()) next.major = 'التخصص مطلوب لمقارنة قرب الدور من دراستك.';
      if (!draft.student.gradYear.trim()) next.gradYear = 'أدخل سنة التخرج المتوقعة.';
      else if (!/^\d{4}$/.test(draft.student.gradYear.trim())) next.gradYear = 'اكتب السنة بأربعة أرقام، مثل 2027.';
      if (!draft.student.city.trim()) next.city = 'اختر مدينتك.';
    }
    if (target > 1 && draft.resume.text.trim().length < 40) {
      next.resume = 'الصق نص السيرة الذاتية (40 حرفًا على الأقل) لنستخرج منه المهارات.';
    }
    if (target > 2) {
      if (!draft.opportunity.title.trim()) next.title = 'اكتب المسمى التدريبي كما ورد في الإعلان.';
      if (!draft.opportunity.org.trim()) next.org = 'اكتب اسم الجهة.';
      if (draft.opportunity.description.trim().length < 40) {
        next.description = 'الصق وصف التدريب ومتطلباته لنستخرج المهارات المطلوبة.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goTo(target: number) {
    if (target > step && !validate(target)) return;
    setStep(Math.max(0, Math.min(STEPS.length - 1, target)));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function useDemoAd() {
    setOpportunity({
      title: DEMO_INPUT.opportunity.title,
      org: DEMO_INPUT.opportunity.org,
      city: DEMO_INPUT.opportunity.city,
      description: DEMO_OPPORTUNITY_TEXT,
      isDemo: true,
    });
  }

  function submit() {
    if (!validate(3)) return;
    runAnalysis(draft, false);
  }

  return (
    <>
      <PageHead
        title="أدخل بياناتك"
        lede="أربع خطوات قصيرة. لا نطلب رقم هوية ولا جوال ولا عنوانًا."
        action={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('landing')}>
            <ArrowRight size={16} />
            العودة للبداية
          </button>
        }
      />

      <nav className="stepper" aria-label="خطوات إدخال البيانات">
        {STEPS.map((item, index) => (
          <button
            key={item.title}
            type="button"
            className={`step ${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`}
            onClick={() => goTo(index)}
            aria-current={index === step ? 'step' : undefined}
          >
            <span className="rail" />
            <span className="caption">
              <span className="idx">{index + 1}</span>
              <span>{item.title}</span>
            </span>
          </button>
        ))}
      </nav>

      <Card>
        {step === 0 ? (
          <div className="stack">
            <div>
              <h2 className="card-title">بيانات الطالب</h2>
              <p className="card-sub">تساعدنا هذه البيانات على قياس قرب الفرصة من تخصصك ومدينتك.</p>
            </div>

            <div className="grid grid-2">
              <Field id="name" label="الاسم الأول" error={errors.name}>
                <input
                  id="name"
                  type="text"
                  value={draft.student.name}
                  placeholder="مثال: نورة"
                  aria-invalid={Boolean(errors.name)}
                  onChange={(event) => setStudent({ name: event.target.value })}
                />
              </Field>

              <Field id="major" label="التخصص" error={errors.major}>
                <input
                  id="major"
                  type="text"
                  value={draft.student.major}
                  placeholder="مثال: نظم معلومات"
                  aria-invalid={Boolean(errors.major)}
                  onChange={(event) => setStudent({ major: event.target.value })}
                />
              </Field>

              <Field id="degree" label="الدرجة العلمية">
                <select
                  id="degree"
                  value={draft.student.degree}
                  onChange={(event) => setStudent({ degree: event.target.value })}
                >
                  {DEGREE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="gradYear" label="سنة التخرج المتوقعة" error={errors.gradYear}>
                <input
                  id="gradYear"
                  type="text"
                  inputMode="numeric"
                  value={draft.student.gradYear}
                  placeholder="2027"
                  aria-invalid={Boolean(errors.gradYear)}
                  onChange={(event) => setStudent({ gradYear: event.target.value })}
                />
              </Field>

              <Field id="city" label="المدينة" error={errors.city}>
                <select
                  id="city"
                  value={draft.student.city}
                  aria-invalid={Boolean(errors.city)}
                  onChange={(event) => setStudent({ city: event.target.value })}
                >
                  <option value="">اختر المدينة</option>
                  {CITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="gpa" label="المعدل" optional hint="لا يؤثر على درجة التطابق، ويُستخدم للعرض فقط.">
                <input
                  id="gpa"
                  type="text"
                  value={draft.student.gpa}
                  placeholder="مثال: 4.3 من 5"
                  onChange={(event) => setStudent({ gpa: event.target.value })}
                />
              </Field>
            </div>

            <Field id="targetField" label="مجال التدريب المستهدف">
              <div className="chip-row">
                {TARGET_FIELDS.map((field) => (
                  <button
                    key={field}
                    type="button"
                    className="chip"
                    aria-pressed={draft.student.targetField === field}
                    onClick={() => setStudent({ targetField: field })}
                  >
                    {field}
                  </button>
                ))}
              </div>
              <input
                id="targetField"
                type="text"
                value={draft.student.targetField}
                placeholder="أو اكتب مجالًا آخر"
                onChange={(event) => setStudent({ targetField: event.target.value })}
                style={{ marginTop: 8 }}
              />
            </Field>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="stack">
            <div>
              <h2 className="card-title">السيرة الذاتية</h2>
              <p className="card-sub">لأفضل نتيجة، تأكد أن السيرة تتضمن مهاراتك ومشاريعك ودوراتك.</p>
            </div>

            <div className="dropzone">
              <span className="icon">
                <UploadCloud size={21} />
              </span>
              <div style={{ fontWeight: 600 }}>ارفع ملف السيرة (PDF أو DOCX)</div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', maxWidth: '46ch' }}>
                هذا النموذج الأولي لا يقرأ محتوى الملفات بعد. سنعرض اسم الملف فقط، ونحتاج منك لصق النص
                في الحقل أدناه ليعمل التحليل.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.doc"
                className="sr-only"
                id="resume-file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setResume({ fileName: file.name });
                }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                اختر ملفًا
              </button>
              {draft.resume.fileName ? (
                <span className="file-pill">
                  <FileText size={15} />
                  {draft.resume.fileName}
                  <button
                    type="button"
                    aria-label="إزالة الملف"
                    onClick={() => {
                      setResume({ fileName: '' });
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                  >
                    <X size={14} />
                  </button>
                </span>
              ) : null}
            </div>

            <Field
              id="resume-text"
              label="نص السيرة الذاتية"
              error={errors.resume}
              hint="الصق النص كاملًا: النبذة، المهارات، المشاريع، الدورات."
            >
              <textarea
                id="resume-text"
                value={draft.resume.text}
                aria-invalid={Boolean(errors.resume)}
                placeholder={'المهارات\nPython، SQL، Excel...\n\nالمشاريع\nمشروع جامعي لتحليل...'}
                onChange={(event) => setResume({ text: event.target.value })}
              />
            </Field>

            <div className="btn-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    resume: { ...DEMO_INPUT.resume },
                  }))
                }
              >
                <ClipboardPaste size={16} />
                استخدم سيرة تجريبية
              </button>
            </div>

            {skills.length > 0 ? (
              <div>
                <p className="card-sub" style={{ marginBottom: 7 }}>
                  المهارات المستخرجة من النص ({skills.length})
                </p>
                <div className="chip-row">
                  {skills.map((skill) => (
                    <Badge key={skill} tone="info">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="stack">
            <div>
              <h2 className="card-title">فرصة التدريب</h2>
              <p className="card-sub">الصق الإعلان كما هو. كلما كان قسم المتطلبات أوضح، كانت النتيجة أدق.</p>
            </div>

            <div className="grid grid-2">
              <Field id="job-title" label="المسمى التدريبي" error={errors.title}>
                <input
                  id="job-title"
                  type="text"
                  value={draft.opportunity.title}
                  placeholder="مثال: متدرب تحليل بيانات"
                  aria-invalid={Boolean(errors.title)}
                  onChange={(event) => setOpportunity({ title: event.target.value })}
                />
              </Field>

              <Field id="org" label="اسم الجهة" error={errors.org}>
                <input
                  id="org"
                  type="text"
                  value={draft.opportunity.org}
                  placeholder="مثال: شركة نمو الرقمية"
                  aria-invalid={Boolean(errors.org)}
                  onChange={(event) => setOpportunity({ org: event.target.value })}
                />
              </Field>

              <Field id="job-city" label="المدينة">
                <select
                  id="job-city"
                  value={draft.opportunity.city}
                  onChange={(event) => setOpportunity({ city: event.target.value })}
                >
                  <option value="">اختر المدينة</option>
                  {CITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="job-url" label="رابط الإعلان" optional>
                <input
                  id="job-url"
                  type="url"
                  dir="ltr"
                  value={draft.opportunity.url}
                  placeholder="https://"
                  onChange={(event) => setOpportunity({ url: event.target.value })}
                />
              </Field>
            </div>

            <Field
              id="job-desc"
              label="وصف التدريب ومتطلباته"
              error={errors.description}
              hint="احرص على تضمين قائمة المتطلبات الأساسية والمفضلة."
            >
              <textarea
                id="job-desc"
                value={draft.opportunity.description}
                aria-invalid={Boolean(errors.description)}
                placeholder={'المتطلبات الأساسية:\n- ...\n\nالمهارات المفضلة:\n- ...'}
                style={{ minHeight: 210 }}
                onChange={(event) => setOpportunity({ description: event.target.value })}
              />
            </Field>

            <div className="btn-row">
              <button type="button" className="btn btn-secondary btn-sm" onClick={useDemoAd}>
                <ClipboardPaste size={16} />
                استخدم إعلانًا تجريبيًا
              </button>
              {draft.opportunity.isDemo ? <Badge tone="demo">إعلان تجريبي</Badge> : null}
            </div>

            {requirements.length > 0 ? (
              <div>
                <p className="card-sub" style={{ marginBottom: 7 }}>
                  المتطلبات المستخرجة ({requirements.length})
                </p>
                <ul className="stack-sm">
                  {requirements.map((line, index) => (
                    <li key={index} style={{ fontSize: 13.5, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--blue)' }}>•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="stack">
            <div>
              <h2 className="card-title">المراجعة</h2>
              <p className="card-sub">تأكد من البيانات قبل التحليل. يمكنك الرجوع لأي خطوة وتعديلها.</p>
            </div>

            <div className="grid grid-2">
              <ReviewCard
                icon={<GraduationCap size={16} />}
                title="بيانات الطالب"
                onEdit={() => goTo(0)}
                rows={[
                  ['الاسم', draft.student.name || '—'],
                  ['التخصص', draft.student.major || '—'],
                  ['الدرجة', draft.student.degree],
                  ['سنة التخرج', draft.student.gradYear || '—'],
                  ['المدينة', draft.student.city || '—'],
                  ['المعدل', draft.student.gpa || 'غير مذكور'],
                  ['المجال المستهدف', draft.student.targetField || '—'],
                ]}
              />

              <ReviewCard
                icon={<Building2 size={16} />}
                title="فرصة التدريب"
                onEdit={() => goTo(2)}
                rows={[
                  ['المسمى', draft.opportunity.title || '—'],
                  ['الجهة', draft.opportunity.org || '—'],
                  ['المدينة', draft.opportunity.city || '—'],
                  ['الرابط', draft.opportunity.url || 'غير مذكور'],
                ]}
              />

              <Card title="المهارات المستخرجة" sub={`${skills.length} مهارة من نص سيرتك`}>
                {skills.length ? (
                  <div className="chip-row">
                    {skills.map((skill) => (
                      <Badge key={skill} tone="info">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="card-sub">لم نتعرّف على مهارات معروفة في النص. يمكنك العودة وإثراء السيرة.</p>
                )}
                <div style={{ marginTop: 12 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => goTo(1)}>
                    تعديل السيرة
                  </button>
                </div>
              </Card>

              <Card title="المتطلبات المستخرجة" sub={`${requirements.length} بند من الإعلان`}>
                {requirements.length ? (
                  <ul className="stack-sm">
                    {requirements.map((line, index) => (
                      <li key={index} style={{ fontSize: 13.5, display: 'flex', gap: 8 }}>
                        <span style={{ color: 'var(--blue)' }}>•</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="card-sub">لم نجد بنودًا واضحة. الصق قسم المتطلبات كقائمة نقاط لنتيجة أدق.</p>
                )}
                <div style={{ marginTop: 12 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => goTo(2)}>
                    تعديل الإعلان
                  </button>
                </div>
              </Card>
            </div>

            <Note tone="muted">
              النتيجة درجة تطابق تقديرية تساعدك على الاستعداد، وليست قرار توظيف ولا ضمان قبول.
            </Note>
          </div>
        ) : null}

        <div className="wizard-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => (step === 0 ? navigate('landing') : goTo(step - 1))}
          >
            <ArrowRight size={17} />
            {step === 0 ? 'إلغاء' : 'السابق'}
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => goTo(step + 1)}>
              التالي
              <ArrowLeft size={17} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={submit}>
              <Sparkles size={17} />
              حلّل مدى تطابقي
            </button>
          )}
        </div>
      </Card>
    </>
  );
}

function Field({
  id,
  label,
  children,
  error,
  hint,
  optional = false,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {optional ? <span className="optional">(اختياري)</span> : null}
      </label>
      {hint ? <span className="hint">{hint}</span> : null}
      {children}
      {error ? (
        <span className="field-error" role="alert">
          <CircleAlert size={14} />
          {error}
        </span>
      ) : null}
    </div>
  );
}

function ReviewCard({
  icon,
  title,
  rows,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <Card
      title={title}
      action={
        <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
          تعديل
        </button>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--blue)', marginBottom: 10 }}>
        {icon}
      </div>
      <dl style={{ display: 'grid', gap: 7, margin: 0 }}>
        {rows.map(([key, value]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13.5 }}>
            <dt style={{ color: 'var(--ink-soft)' }}>{key}</dt>
            <dd style={{ margin: 0, fontWeight: 600, textAlign: 'end', wordBreak: 'break-word' }}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
