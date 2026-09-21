import type { AnalysisResult, PlanTask, PlanWeek, SkillFinding } from '../types';

/** نفس ترتيب الفجوات المستخدم في التقرير: الأساسية أولًا ثم الأبعد عن المستوى المطلوب */
function rank(list: SkillFinding[]): SkillFinding[] {
  return [...list].sort((a, b) => {
    if (a.group !== b.group) return a.group === 'core' ? -1 : 1;
    return b.required - b.current - (a.required - a.current);
  });
}

function gapLabels(result: AnalysisResult): [string, string] {
  const ordered = [
    ...rank(result.skills.filter((s) => s.status === 'gap')),
    ...rank(result.skills.filter((s) => s.status === 'partial')),
    ...result.skills,
  ];
  return [ordered[0]?.label ?? 'المهارة الأساسية', ordered[1]?.label ?? 'مهارة العرض'];
}

/** يبني خطة أربعة أسابيع مرتبطة بأكبر فجوتين في نتيجة التحليل */
export function buildPlan(result: AnalysisResult): PlanWeek[] {
  const [gapOne, gapTwo] = gapLabels(result);
  const field = result.isDemo ? 'تحليل البيانات' : 'المجال المستهدف';
  const topGapId = result.topGapId;

  return [
    {
      id: 'w1',
      index: 1,
      title: 'سد الفجوة الأساسية',
      goal: `الوصول بمهارة ${gapOne} من مستوى المعرفة العامة إلى أساس قابل للعرض.`,
      tasks: [
        {
          id: 'w1-t1',
          title: `إكمال درس مقدمة ${gapOne}`,
          detail: `اختر مسارًا تأسيسيًا واحدًا في ${gapOne} وأكمل الوحدة الأولى كاملة دون تشتيت بين أكثر من مصدر. الهدف فهم الواجهة وطريقة ربط مصدر بيانات بسيط.`,
          minutes: 30,
          priority: 'high',
          skillId: topGapId,
          today: true,
        },
        {
          id: 'w1-t2',
          title: 'تطبيق تمارين تنظيف البيانات',
          detail:
            'خذ ملف بيانات صغيرًا فيه قيم ناقصة وصفوف مكررة، ونفّذ عليه: توحيد الأعمدة، معالجة الفراغات، حذف التكرار. احتفظ بالملف قبل وبعد.',
          minutes: 45,
          priority: 'high',
          skillId: topGapId,
          today: true,
        },
        {
          id: 'w1-t3',
          title: 'إنشاء أول Visual بسيط وحفظ لقطة من النتيجة',
          detail:
            'أنشئ رسمًا بيانيًا واحدًا يجيب على سؤال واضح مثل: ما أعلى ثلاثة منتجات مبيعًا؟ ثم احفظ لقطة الشاشة لاستخدامها لاحقًا في معرض أعمالك.',
          minutes: 15,
          priority: 'medium',
          skillId: topGapId,
          today: true,
        },
      ],
    },
    {
      id: 'w2',
      index: 2,
      title: 'إثبات المهارة',
      goal: 'تحويل ما تعلمته إلى مخرج واحد ملموس يمكن عرضه على الجهة.',
      tasks: [
        {
          id: 'w2-t1',
          title: 'بناء Dashboard لمبيعات متجر تجريبي',
          detail:
            'استخدم مجموعة بيانات مبيعات مفتوحة، وابنِ لوحة من ثلاث بطاقات ورسمين. ركّز على الوضوح لا على عدد العناصر.',
          minutes: 120,
          priority: 'high',
          skillId: topGapId,
          today: false,
        },
        {
          id: 'w2-t2',
          title: 'إضافة ثلاثة مؤشرات أداء KPI إلى اللوحة',
          detail:
            'اختر ثلاثة مؤشرات لها معنى تجاري: إجمالي المبيعات، متوسط قيمة الطلب، نسبة النمو الشهري. واكتب تعريف كل مؤشر بجملة.',
          minutes: 60,
          priority: 'high',
          skillId: null,
          today: false,
        },
        {
          id: 'w2-t3',
          title: 'كتابة وصف قصير للمشكلة والنتيجة',
          detail:
            'اكتب فقرة من ثلاثة أسطر: ما السؤال؟ ماذا فعلت؟ ما الرقم الذي خرجت به؟ هذه الفقرة ستدخل في سيرتك لاحقًا.',
          minutes: 40,
          priority: 'medium',
          skillId: null,
          today: false,
        },
      ],
    },
    {
      id: 'w3',
      index: 3,
      title: 'تجهيز ملف التقديم',
      goal: 'نقل المخرج الجديد إلى السيرة الذاتية بصياغة تُقرأ بسرعة.',
      tasks: [
        {
          id: 'w3-t1',
          title: 'إضافة المشروع إلى السيرة الذاتية',
          detail:
            'أضف المشروع في قسم المشاريع مع سطر واحد للنتيجة ورابط إن وُجد. رتّب المشاريع بحيث يظهر الأحدث والأقرب للفرصة أولًا.',
          minutes: 30,
          priority: 'high',
          skillId: null,
          today: false,
        },
        {
          id: 'w3-t2',
          title: 'إعادة كتابة وصف المشروع بأفعال قوية وأرقام',
          detail:
            'استبدل «عملت على» بفعل دقيق مثل «حللت» أو «بنيت»، وأضف رقمًا واحدًا على الأقل: عدد الصفوف، عدد المؤشرات، نسبة التحسن.',
          minutes: 40,
          priority: 'high',
          skillId: null,
          today: false,
        },
        {
          id: 'w3-t3',
          title: `إضافة ${gapOne} و${gapTwo} إلى قسم المهارات`,
          detail:
            'لا تضف المهارة إلا بعد وجود دليل يدعمها في قسم المشاريع، حتى تبقى السيرة متسقة أمام المُراجع.',
          minutes: 20,
          priority: 'medium',
          skillId: null,
          today: false,
        },
      ],
    },
    {
      id: 'w4',
      index: 4,
      title: 'الاستعداد للتقديم',
      goal: 'الوصول إلى طلب مكتمل وجاهز للإرسال دون تأجيل.',
      tasks: [
        {
          id: 'w4-t1',
          title: `مراجعة أسئلة مقابلات ${field}`,
          detail:
            'جهّز إجابات قصيرة لخمسة أسئلة متوقعة، وابنِ كل إجابة على موقف حقيقي من مشاريعك لا على تعريف نظري.',
          minutes: 60,
          priority: 'medium',
          skillId: null,
          today: false,
        },
        {
          id: 'w4-t2',
          title: 'تنفيذ مقابلة تجريبية',
          detail:
            'اطلب من زميل أو زميلة إجراء مقابلة قصيرة معك وسجّل الوقت. الهدف أن تشرح مشروعك في دقيقتين بوضوح.',
          minutes: 45,
          priority: 'medium',
          skillId: null,
          today: false,
        },
        {
          id: 'w4-t3',
          title: 'تخصيص السيرة للفرصة',
          detail:
            'أعد ترتيب المهارات بحيث تظهر المهارات المطلوبة في الإعلان أولًا، واحذف ما لا يخدم هذه الفرصة تحديدًا.',
          minutes: 35,
          priority: 'high',
          skillId: null,
          today: false,
        },
        {
          id: 'w4-t4',
          title: 'مراجعة الطلب وإرساله',
          detail:
            'راجع الإملاء وروابط المشاريع وصيغة الملف، ثم أرسل الطلب. حدد موعدًا للمتابعة بعد أسبوع.',
          minutes: 15,
          priority: 'high',
          skillId: null,
          today: false,
        },
      ],
    },
  ];
}

/** مهمة تُضاف يدويًا من صفحة فجوة المهارات عبر زر «أضف إلى خطتي» */
export function buildExtraTask(skill: SkillFinding): PlanTask {
  return {
    id: `extra-${skill.id}`,
    title: `رفع مستوى ${skill.label} إلى ${skill.required}٪`,
    detail: `${skill.recommendation} المستوى الحالي المُقدَّر ${skill.current}٪ والمطلوب ${skill.required}٪.`,
    minutes: skill.status === 'gap' ? 60 : 30,
    priority: skill.status === 'gap' ? 'high' : 'medium',
    skillId: skill.id,
    today: false,
  };
}

export const TODAY_MESSAGE = 'ثلاث خطوات صغيرة اليوم تقرّبك من التقديم.';
