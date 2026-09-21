import { ArrowLeft, FileSearch, ListChecks, PlayCircle, ScanSearch, ShieldCheck } from 'lucide-react';
import { useApp } from '../state/AppState';
import { Badge, Bar, Brand, Note } from '../components/ui';

const FEATURES = [
  {
    icon: FileSearch,
    title: 'تحليل السيرة',
    body: 'نقرأ مهاراتك ومشاريعك ودوراتك، ونستخرج الأدلة التي تدعم كل مهارة.',
  },
  {
    icon: ScanSearch,
    title: 'كشف فجوات المهارات',
    body: 'نقارن ما لديك بما يطلبه الإعلان، ونرتّب الفجوات حسب أثرها على قبولك.',
  },
  {
    icon: ListChecks,
    title: 'خطة استعداد مخصصة',
    body: 'أربعة أسابيع بمهام قصيرة قابلة للتنفيذ، تنتهي بطلب جاهز للإرسال.',
  },
];

export function Landing() {
  const { navigate, startDemo, session } = useApp();

  return (
    <div className="landing">
      <header className="landing-bar">
        <Brand onLight />
        <div className="btn-row">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('privacy')}>
            <ShieldCheck size={16} />
            الخصوصية
          </button>
          {session ? (
            <button type="button" className="btn btn-navy btn-sm" onClick={() => navigate('dashboard')}>
              متابعة تحليلي السابق
              <ArrowLeft size={16} />
            </button>
          ) : null}
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <Badge tone="info" icon={<ShieldCheck size={13} />}>
            نموذج أولي — يعمل بالكامل داخل متصفحك
          </Badge>
          <h1 style={{ marginTop: 14 }}>فرصة التدريب أقرب مما تتوقع</h1>
          <p className="hero-lede">
            قارن مهاراتك بمتطلبات التدريب، واكتشف ما ينقصك، واحصل على خطة استعداد مخصصة.
          </p>

          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={() => navigate('wizard')}>
              ابدأ تحليل ملفي
              <ArrowLeft size={17} />
            </button>
            <button type="button" className="btn btn-secondary" onClick={startDemo}>
              <PlayCircle size={17} />
              جرّب ببيانات تجريبية
            </button>
          </div>

          <div className="hero-cards">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article className="hero-card" key={feature.title}>
                  <span className="icon">
                    <Icon size={18} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              );
            })}
          </div>

          <div style={{ marginTop: 22 }}>
            <Note tone="muted">
              لن نعرض نسبة قبول، بل درجة تطابق مبنية على البيانات المدخلة.
            </Note>
          </div>
        </section>

        <section className="preview" aria-label="معاينة لشكل النتيجة">
          <div className="preview-head">
            <span className="preview-title">معاينة تقرير التطابق</span>
            <Badge tone="demo">مثال</Badge>
          </div>
          <div className="preview-body">
            <div className="preview-row">
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>متدرب تحليل بيانات</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>شركة نمو الرقمية — الرياض</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>77٪</div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>درجة تطابق</div>
              </div>
            </div>

            <hr className="divider" style={{ margin: 0 }} />

            <div className="stack-sm">
              {[
                { name: 'SQL', now: 80, need: 75, tone: 'success' as const },
                { name: 'Python', now: 70, need: 70, tone: 'success' as const },
                { name: 'Power BI', now: 35, need: 75, tone: 'danger' as const },
              ].map((skill) => (
                <div className="preview-skill" key={skill.name}>
                  <div className="top">
                    <span style={{ fontWeight: 600 }}>{skill.name}</span>
                    <span style={{ color: 'var(--ink-soft)' }}>
                      {skill.now}٪ من {skill.need}٪
                    </span>
                  </div>
                  <Bar value={skill.now} tone={skill.tone} label={skill.name} />
                </div>
              ))}
            </div>

            <div
              style={{
                background: 'var(--blue-tint)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 12.5,
                lineHeight: 1.7,
              }}
            >
              <strong>الخطوة التالية:</strong> إكمال مقدمة Power BI وبناء لوحة معلومات صغيرة — 30 دقيقة.
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-foot">
        <div className="inner">
          <span>مُرشد — نموذج أولي لأغراض العرض. الجهات والفرص الظاهرة تجريبية.</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('privacy')}>
            كيف نتعامل مع بياناتك؟
          </button>
        </div>
      </footer>
    </div>
  );
}
