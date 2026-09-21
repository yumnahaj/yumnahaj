import { ArrowRight, Check, Copy, FileText, KeyRound, Lightbulb, Printer, Wand2 } from 'lucide-react';
import { useApp } from '../state/AppState';
import { PageHead } from '../components/Layout';
import { Badge, Card, DemoBadge, Note, Stat } from '../components/ui';
import { copyText } from '../lib/utils';

export function Resume() {
  const {
    result,
    input,
    navigate,
    resumeDraft,
    applySuggestion,
    isSuggestionApplied,
    showToast,
  } = useApp();
  if (!result || !input) return null;

  async function handleCopy(text: string) {
    const ok = await copyText(text);
    showToast(ok ? 'تم نسخ النص' : 'تعذّر النسخ، حدّد النص وانسخه يدويًا');
  }

  return (
    <>
      <PageHead
        title="تحسين السيرة"
        lede="اقتراحات مبنية على الفرق بين سيرتك ومتطلبات هذه الفرصة تحديدًا."
        badge={input.opportunity.isDemo ? <DemoBadge /> : null}
        action={
          <div className="btn-row no-print">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={15} />
              طباعة السيرة
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('report')}>
              <ArrowRight size={15} />
              العودة للتقرير
            </button>
          </div>
        }
      />

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <Stat
          icon={<FileText size={15} />}
          label="جاهزية السيرة"
          value={`${result.resumeReadiness}٪`}
          bar={{ value: result.resumeReadiness, tone: result.resumeReadiness >= 75 ? 'success' : 'warn' }}
          foot="تُحسب من الكلمات الناقصة ووضوح الأثر"
        />
        <Stat
          icon={<KeyRound size={15} />}
          label="الكلمات المفتاحية الناقصة"
          value={`${result.missingKeywords.length}`}
          foot={result.missingKeywords.join('، ') || 'لا توجد كلمات ناقصة'}
        />
        <Stat
          icon={<Lightbulb size={15} />}
          label="عدد الاقتراحات"
          value={`${result.suggestions.length}`}
          foot={`طُبِّق منها ${result.suggestions.filter((item) => isSuggestionApplied(item.id)).length}`}
        />
      </div>

      {result.missingKeywords.length > 0 ? (
        <Card
          title="الكلمات المفتاحية الناقصة"
          sub="كلمات وردت في الإعلان ولم نجدها في نص سيرتك."
          className="no-print"
          action={
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => handleCopy(result.missingKeywords.join('، '))}
            >
              <Copy size={15} />
              نسخ الكلمات
            </button>
          }
        >
          <div className="keyword-grid">
            {result.missingKeywords.map((keyword) => (
              <Badge key={keyword} tone="warn">
                {keyword}
              </Badge>
            ))}
          </div>
          <div style={{ marginTop: 13 }}>
            <Note tone="muted">
              أضف الكلمة بعد أن يصبح لديك دليل يدعمها في المشاريع، حتى تبقى سيرتك صادقة أمام المُراجع.
            </Note>
          </div>
        </Card>
      ) : null}

      <div className="resume-split" style={{ marginTop: 16 }}>
        <div className="stack">
          {result.suggestions.map((suggestion) => {
            const applied = isSuggestionApplied(suggestion.id);
            return (
              <article key={suggestion.id} className={applied ? 'suggestion applied' : 'suggestion'}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 15.5 }}>{suggestion.title}</h3>
                    <p className="card-sub">{suggestion.target}</p>
                  </div>
                  {applied ? (
                    <Badge tone="success" icon={<Check size={12} />}>
                      مُطبَّق
                    </Badge>
                  ) : null}
                </div>

                <div className="ba">
                  <div className="ba-block ba-before">
                    <span className="ba-tag">قبل</span>
                    {suggestion.before}
                  </div>
                  <div className="ba-block ba-after">
                    <span className="ba-tag">بعد</span>
                    {suggestion.after}
                  </div>
                </div>

                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.8 }}>{suggestion.why}</p>

                <div className="btn-row no-print">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(suggestion.after)}
                  >
                    <Copy size={15} />
                    نسخ الصياغة
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={applied}
                    onClick={() => applySuggestion(suggestion.id)}
                  >
                    <Wand2 size={15} />
                    {applied ? 'طُبِّق على المعاينة' : 'تطبيق الاقتراح'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="resume-preview">
          <Card
            title="معاينة السيرة"
            sub="تتحدث المعاينة مباشرة عند تطبيق أي اقتراح."
            action={
              <button
                type="button"
                className="btn btn-ghost btn-sm no-print"
                onClick={() => handleCopy(resumeDraft)}
              >
                <Copy size={15} />
                نسخ السيرة
              </button>
            }
          >
            {resumeDraft.trim() ? (
              <div className="resume-paper">{resumeDraft}</div>
            ) : (
              <p className="card-sub">لا يوجد نص سيرة محفوظ. عد إلى نموذج الإدخال وألصق سيرتك.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
