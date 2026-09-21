/**
 * قاموس المهارات: يوحّد الأسماء العربية والإنجليزية تحت معرّف واحد.
 * يُستخدم في محرك التحليل لمطابقة نص الإعلان بنص السيرة.
 */

export interface SkillDefinition {
  id: string;
  label: string;
  aliases: string[];
  /**
   * المستوى المعتاد المطلوب لهذه المهارة في تدريب تعاوني.
   * يُخفَّض خمس نقاط إذا وردت المهارة ضمن المهارات المفضلة لا الأساسية.
   */
  requiredLevel: number;
  /** مهارات قريبة تمنح مستوى جزئيًا عند غياب المهارة نفسها */
  related?: string[];
  recommendation: string;
}

export interface KeywordDefinition {
  id: string;
  label: string;
  aliases: string[];
}

export const SKILL_LIBRARY: SkillDefinition[] = [
  {
    id: 'excel',
    label: 'Excel',
    aliases: ['excel', 'اكسل', 'إكسل', 'الجداول الحسابيه', 'جداول بيانات', 'spreadsheet'],
    requiredLevel: 75,
    recommendation: 'أضف مثالًا لجدول محوري أو دالة بحث استخدمتها في تحليل فعلي.',
  },
  {
    id: 'sql',
    label: 'SQL',
    aliases: ['sql', 'قواعد البيانات', 'استعلامات', 'mysql', 'postgres', 'قاعده بيانات'],
    requiredLevel: 75,
    recommendation: 'اذكر نوع الاستعلامات التي كتبتها مثل JOIN والتجميع، وحجم البيانات تقريبًا.',
  },
  {
    id: 'python',
    label: 'Python',
    aliases: ['python', 'بايثون', 'pandas', 'numpy'],
    requiredLevel: 70,
    recommendation: 'اذكر المكتبات التي استخدمتها والغرض منها بدل ذكر اسم اللغة فقط.',
  },
  {
    id: 'powerbi',
    label: 'Power BI',
    aliases: ['power bi', 'powerbi', 'باور بي اي', 'tableau', 'looker studio'],
    requiredLevel: 75,
    related: ['excel', 'dataviz'],
    recommendation: 'أكمل دورة تأسيسية ثم ابنِ لوحة معلومات واحدة ترفعها كدليل.',
  },
  {
    id: 'dataviz',
    label: 'سرد البيانات',
    aliases: [
      'سرد البيانات',
      'عرض البيانات',
      'تصور البيانات',
      'data visualization',
      'visualization',
      'storytelling',
      'رسوم بيانيه',
    ],
    requiredLevel: 70,
    related: ['excel', 'powerbi'],
    recommendation: 'حوّل مخرجات تحليلك إلى ثلاث رسائل واضحة مدعومة برسم بياني واحد لكل رسالة.',
  },
  {
    id: 'dataanalysis',
    label: 'تحليل البيانات',
    aliases: ['تحليل البيانات', 'تحليل بيانات', 'data analysis', 'analytics', 'تحليل احصايي'],
    requiredLevel: 75,
    recommendation: 'وضّح سؤال التحليل والنتيجة التي وصلت إليها، لا الأدوات فقط.',
  },
  {
    id: 'communication',
    label: 'التواصل',
    aliases: ['تواصل', 'التواصل', 'عرض النتايج', 'مهارات العرض', 'communication', 'presentation'],
    requiredLevel: 75,
    recommendation: 'أضف موقفًا عرضت فيه نتيجة أمام فريق أو في مادة دراسية.',
  },
  {
    id: 'statistics',
    label: 'الإحصاء',
    aliases: ['احصاء', 'الاحصاء', 'statistics', 'احتمالات', 'انحدار', 'regression'],
    requiredLevel: 70,
    recommendation: 'اذكر أسلوبًا إحصائيًا طبقته فعليًا مثل الانحدار أو اختبار الفرضيات.',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    aliases: ['javascript', 'js', 'typescript', 'جافاسكربت'],
    requiredLevel: 75,
    recommendation: 'ارفع مستودعًا صغيرًا يوضح كتابتك للكود بدل ذكر اللغة فقط.',
  },
  {
    id: 'react',
    label: 'React',
    aliases: ['react', 'ريكت', 'next.js', 'nextjs', 'vue', 'angular'],
    requiredLevel: 75,
    related: ['javascript'],
    recommendation: 'ابنِ واجهة صغيرة تعرض بيانات حقيقية وانشرها كرابط قابل للفتح.',
  },
  {
    id: 'git',
    label: 'Git',
    aliases: ['git', 'github', 'gitlab', 'جيت'],
    requiredLevel: 70,
    recommendation: 'نظّم مستودعاتك وأضف ملف README لكل مشروع رئيسي.',
  },
  {
    id: 'apis',
    label: 'واجهات برمجية',
    aliases: ['api', 'rest', 'واجهات برمجيه', 'خدمات ويب', 'backend'],
    requiredLevel: 70,
    recommendation: 'اشرح نقطة نهاية بنيتها أو استهلكتها وما البيانات التي تعالجها.',
  },
  {
    id: 'networks',
    label: 'الشبكات',
    aliases: ['الشبكات', 'شبكات', 'networking', 'tcp', 'firewall', 'جدار ناري'],
    requiredLevel: 70,
    recommendation: 'اربط معرفتك بالشبكات بتمرين عملي على بيئة مختبرية.',
  },
  {
    id: 'security',
    label: 'الأمن السيبراني',
    aliases: ['امن سيبراني', 'الامن السيبراني', 'cybersecurity', 'security', 'اختبار اختراق', 'soc'],
    requiredLevel: 75,
    recommendation: 'وثّق تحديًا أمنيًا حللته وخطوات المعالجة التي اتبعتها.',
  },
  {
    id: 'uxresearch',
    label: 'بحث المستخدم',
    aliases: ['بحث المستخدم', 'user research', 'ux research', 'مقابلات مستخدمين', 'usability'],
    requiredLevel: 70,
    recommendation: 'لخّص بحثًا صغيرًا: من قابلت، وما القرار الذي غيّرته النتائج.',
  },
  {
    id: 'figma',
    label: 'Figma',
    aliases: ['figma', 'فيقما', 'فيجما', 'prototyping', 'نماذج اوليه', 'wireframe'],
    requiredLevel: 75,
    related: ['uxresearch'],
    recommendation: 'ارفع نموذجًا تفاعليًا واحدًا مع شرح قرارات التصميم.',
  },
  {
    id: 'seo',
    label: 'تحسين محركات البحث',
    aliases: ['seo', 'محركات البحث', 'تحسين محركات البحث'],
    requiredLevel: 70,
    recommendation: 'اعرض مثالًا على كلمات مفتاحية حسّنت ترتيب صفحة فعلية.',
  },
  {
    id: 'contentmarketing',
    label: 'تسويق المحتوى',
    aliases: ['تسويق المحتوى', 'content marketing', 'وسايل التواصل', 'social media', 'حملات اعلانيه'],
    requiredLevel: 70,
    recommendation: 'أرفق نتائج حملة بالأرقام: وصول، تفاعل، تحويل.',
  },
  {
    id: 'teamwork',
    label: 'العمل الجماعي',
    aliases: ['العمل الجماعي', 'عمل الفريق', 'teamwork', 'ضمن فريق'],
    requiredLevel: 70,
    recommendation: 'اذكر دورك تحديدًا داخل الفريق لا وصف الفريق نفسه.',
  },
];

/** كلمات مفتاحية يبحث عنها فارز السير الذاتية، وقد لا تكون مهارة مُقيَّمة */
export const KEYWORD_LIBRARY: KeywordDefinition[] = [
  { id: 'kw-powerbi', label: 'Power BI', aliases: ['power bi', 'powerbi', 'باور بي اي'] },
  { id: 'kw-dashboard', label: 'Dashboard', aliases: ['dashboard', 'dashboards', 'لوحه معلومات', 'لوحات معلومات', 'لوحه مؤشرات'] },
  {
    id: 'kw-dataviz',
    label: 'Data Visualization',
    aliases: ['data visualization', 'visualization', 'تصور البيانات', 'عرض البيانات'],
  },
  { id: 'kw-kpi', label: 'KPI', aliases: ['kpi', 'kpis', 'مؤشرات الاداء', 'مؤشر اداء'] },
  { id: 'kw-sql', label: 'SQL', aliases: ['sql'] },
  { id: 'kw-python', label: 'Python', aliases: ['python', 'بايثون'] },
  { id: 'kw-excel', label: 'Excel', aliases: ['excel', 'اكسل'] },
  { id: 'kw-git', label: 'Git', aliases: ['git', 'github'] },
  { id: 'kw-figma', label: 'Figma', aliases: ['figma', 'فيقما'] },
  { id: 'kw-seo', label: 'SEO', aliases: ['seo', 'محركات البحث'] },
];

export const TARGET_FIELDS = [
  'تحليل البيانات',
  'تطوير البرمجيات',
  'الأمن السيبراني',
  'تجربة المستخدم',
  'التسويق الرقمي',
];

export const DEGREE_OPTIONS = ['بكالوريوس', 'دبلوم', 'ماجستير'];

export const CITY_OPTIONS = [
  'الرياض',
  'جدة',
  'الدمام',
  'الخبر',
  'مكة المكرمة',
  'المدينة المنورة',
  'أبها',
  'تبوك',
  'عن بُعد',
];

export function findSkill(id: string): SkillDefinition | undefined {
  return SKILL_LIBRARY.find((skill) => skill.id === id);
}
