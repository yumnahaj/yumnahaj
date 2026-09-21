import {
  ArrowRight,
  Database,
  EyeOff,
  FlaskConical,
  Gauge,
  Laptop,
  RotateCcw,
  TagIcon,
} from 'lucide-react';
import { useApp } from '../state/AppState';
import { PageHead } from '../components/Layout';
import { Card, Note } from '../components/ui';

const POINTS = [
  {
    icon: FlaskConical,
    title: 'النموذج الحالي تجريبي',
    body: 'مُرشد نموذج أولي لأغراض العرض. لا يوجد خلفه نموذج ذكاء اصطناعي ولا خادم؛ التحليل يعتمد على مطابقة نصية محلية بين سيرتك ونص الإعلان.',
  },
  {
    icon: Laptop,
    title: 'بياناتك تُحفظ محليًا في متصفحك',
    body: 'كل ما تدخله يُخزَّن في localStorage على جهازك فقط، ولا يُرسل إلى أي خادم أو طرف ثالث.',
  },
  {
    icon: RotateCcw,
    title: 'يمكنك حذف بياناتك في أي وقت',
    body: 'زر «إعادة ضبط البيانات» في أسفل القائمة يمسح التحليل والخطة والتقدم نهائيًا من هذا المتصفح.',
  },
  {
    icon: Gauge,
    title: 'درجة التطابق ليست ضمان قبول',
    body: 'الدرجة تقديرية تساعدك على ترتيب أولويات استعدادك، وليست قرار توظيف ولا احتمالية قبول صادرة عن أي جهة.',
  },
  {
    icon: TagIcon,
    title: 'الفرص والجهات التجريبية موسومة بوضوح',
    body: 'أي بيانات جهة أو فرصة داخل النموذج تحمل شارة «بيانات تجريبية»، وهي غير مرتبطة بجهة حقيقية.',
  },
  {
    icon: EyeOff,
    title: 'لا نطلب بيانات حساسة',
    body: 'لا نطلب رقم الهوية ولا رقم الجوال ولا العنوان. الحقول المطلوبة هي ما يخدم المقارنة فقط.',
  },
];

export function Privacy() {
  const { navigate, session, resetAll } = useApp();

  return (
    <>
      <PageHead
        title="الخصوصية والنزاهة"
        lede="ما الذي يحدث لبياناتك داخل مُرشد، وما الذي لا يعِدك به هذا النموذج."
        action={
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(session ? 'dashboard' : 'landing')}
          >
            <ArrowRight size={15} />
            {session ? 'العودة للوحة' : 'العودة للبداية'}
          </button>
        }
      />

      <Card>
        <ul className="privacy-list">
          {POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.title}>
                <span className="icon">
                  <Icon size={17} />
                </span>
                <span>
                  <strong style={{ display: 'block', marginBottom: 2 }}>{point.title}</strong>
                  <span style={{ color: 'var(--ink-soft)' }}>{point.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="stack" style={{ marginTop: 16 }}>
        <Note tone="muted">
          <strong>ما هو حقيقي في هذا النموذج؟</strong>
          محرك المطابقة النصية، وحساب درجة التطابق بأوزانها الخمسة، وتوليد الخطة، وحفظ التقدم — كلها
          تعمل فعليًا داخل متصفحك. أما قراءة ملفات PDF وDOCX وربط فرص تدريب حقيقية فغير مفعّلة بعد.
        </Note>

        {session ? (
          <Card
            title="حذف بياناتي من هذا المتصفح"
            sub="سيُحذف التحليل والخطة وتقدّم المهام نهائيًا."
          >
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                resetAll();
              }}
            >
              <Database size={15} />
              حذف بياناتي الآن
            </button>
          </Card>
        ) : null}
      </div>
    </>
  );
}
