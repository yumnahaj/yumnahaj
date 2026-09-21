import { KEYWORD_LIBRARY, SKILL_LIBRARY, type SkillDefinition } from '../data/skills';
import type {
  AnalysisInput,
  AnalysisResult,
  AnalysisWarning,
  ResumeSuggestion,
  ScoreComponent,
  SkillFinding,
  SkillGroup,
  SkillStatus,
} from '../types';

/* ------------------------------------------------------------------ */
/* أدوات نصية                                                          */
/* ------------------------------------------------------------------ */

/** توحيد النص العربي: إزالة التشكيل وتوحيد الهمزات والتاء المربوطة */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[،؛]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitLines(text: string): string[] {
  return text
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitSentences(text: string): string[] {
  return text
    .split(/[\n\r.؟!]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2);
}

function isBullet(line: string): boolean {
  return /^([-–—*•·]|\d+[.)-]|[أ-ي]\s*[-)])\s*/.test(line);
}

function isHeader(line: string): boolean {
  return line.endsWith(':') || line.endsWith('：');
}

function containsAlias(haystack: string, aliases: string[]): boolean {
  return aliases.some((alias) => haystack.includes(normalize(alias)));
}

const PREFERRED_MARKERS = ['مفضل', 'يفضل', 'تفضل', 'ميزه اضافيه', 'اضافيه', 'يعتبر ميزه', 'preferred', 'nice to have', 'plus'];
const PROJECT_MARKERS = [
  'مشروع',
  'مشاريع',
  'عملت',
  'بنيت',
  'نفذت',
  'طبقت',
  'صممت',
  'حللت',
  'استخدمت',
  'خبره',
  'انشات',
];
const COURSE_MARKERS = ['دوره', 'دورات', 'مقرر', 'شهاده', 'شهادات', 'course', 'certificate'];
const PROFICIENCY_MARKERS = ['اجاده', 'متقدم', 'متمكن', 'احتراف', 'ممتاز', 'advanced', 'expert'];
const LINK_MARKERS = ['http', 'github', 'linkedin', 'behance', 'رابط'];
const START_TERM_MARKERS = [
  'الفصل الاول',
  'الفصل الثاني',
  'الفصل الصيفي',
  'تاريخ البدء',
  'يبدا في',
  'موعد البدايه',
  'يناير',
  'فبراير',
  'مارس',
  'ابريل',
  'مايو',
  'يونيو',
  'يوليو',
  'اغسطس',
  'سبتمبر',
  'اكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/* ------------------------------------------------------------------ */
/* تحليل الإعلان                                                       */
/* ------------------------------------------------------------------ */

interface Requirement {
  skill: SkillDefinition;
  group: SkillGroup;
}

function collectRequirements(description: string): { requirements: Requirement[]; keywords: string[] } {
  const lines = splitLines(description);
  const found = new Map<string, SkillGroup>();
  const keywords = new Set<string>();

  const scan = (bulletsOnly: boolean) => {
    let group: SkillGroup = 'core';
    for (const rawLine of lines) {
      const line = normalize(rawLine);
      if (isHeader(rawLine)) {
        group = containsAlias(line, PREFERRED_MARKERS) ? 'preferred' : 'core';
        continue;
      }
      if (bulletsOnly && !isBullet(rawLine)) continue;

      const lineGroup: SkillGroup = containsAlias(line, PREFERRED_MARKERS) ? 'preferred' : group;
      for (const skill of SKILL_LIBRARY) {
        if (!containsAlias(line, skill.aliases)) continue;
        const existing = found.get(skill.id);
        // المهارة الأساسية تغلب المفضلة إذا ذُكرت في الموضعين
        if (existing === 'core') continue;
        found.set(skill.id, lineGroup);
      }
      for (const keyword of KEYWORD_LIBRARY) {
        if (containsAlias(line, keyword.aliases)) keywords.add(keyword.label);
      }
    }
  };

  scan(true);
  if (found.size === 0) {
    keywords.clear();
    scan(false);
  }

  const requirements: Requirement[] = [];
  for (const [id, group] of found) {
    const skill = SKILL_LIBRARY.find((item) => item.id === id);
    if (skill) requirements.push({ skill, group });
  }
  return { requirements, keywords: [...keywords] };
}

/* ------------------------------------------------------------------ */
/* تحليل السيرة                                                        */
/* ------------------------------------------------------------------ */

interface ResumeSignals {
  normalized: string;
  sentences: string[];
  normalizedSentences: string[];
  wordCount: number;
  hasProjects: boolean;
  hasSkillsSection: boolean;
  hasCourses: boolean;
  hasLink: boolean;
  hasQuantifiedImpact: boolean;
  projectSentences: string[];
}

function readResume(text: string): ResumeSignals {
  const sentences = splitSentences(text);
  const normalizedSentences = sentences.map(normalize);
  const normalized = normalize(text);
  const projectSentences = normalizedSentences.filter((sentence) => containsAlias(sentence, PROJECT_MARKERS));

  return {
    normalized,
    sentences,
    normalizedSentences,
    wordCount: normalized.split(' ').filter(Boolean).length,
    hasProjects: projectSentences.length > 0,
    hasSkillsSection: normalized.includes('المهارات') || normalized.includes('skills'),
    hasCourses: containsAlias(normalized, COURSE_MARKERS),
    hasLink: containsAlias(normalized, LINK_MARKERS),
    hasQuantifiedImpact: projectSentences.some((sentence) => /\d/.test(sentence) || sentence.includes('%')),
    projectSentences,
  };
}

interface SkillAssessment {
  level: number;
  evidence: string | null;
  reason: string;
}

function assessSkill(skill: SkillDefinition, resume: ResumeSignals): SkillAssessment {
  const matchIndexes: number[] = [];
  resume.normalizedSentences.forEach((sentence, index) => {
    if (containsAlias(sentence, skill.aliases)) matchIndexes.push(index);
  });

  if (matchIndexes.length === 0) {
    const relatedLabels = (skill.related ?? [])
      .map((id) => SKILL_LIBRARY.find((item) => item.id === id))
      .filter((item): item is SkillDefinition => Boolean(item))
      .filter((item) => containsAlias(resume.normalized, item.aliases));

    if (relatedLabels.length > 0) {
      const names = relatedLabels.map((item) => item.label).join(' و');
      return {
        level: Math.min(40, 28 + relatedLabels.length * 6),
        evidence: null,
        reason: `لم يُذكر ${skill.label} في السيرة، لكن وجود ${names} يمنحك نقطة انطلاق أقرب.`,
      };
    }
    return {
      level: 0,
      evidence: null,
      reason: `لم نجد أي ذكر لـ${skill.label} في نص السيرة.`,
    };
  }

  let level = 55;
  const reasons: string[] = [];

  const inProject = matchIndexes.some((index) => containsAlias(resume.normalizedSentences[index], PROJECT_MARKERS));
  const inCourse = matchIndexes.some((index) => containsAlias(resume.normalizedSentences[index], COURSE_MARKERS));
  const withProficiency = matchIndexes.some((index) =>
    containsAlias(resume.normalizedSentences[index], PROFICIENCY_MARKERS),
  );
  const withNumbers = matchIndexes.some((index) => /\d/.test(resume.normalizedSentences[index]));

  if (inProject) {
    level += 15;
    reasons.push('مذكور داخل سياق مشروع أو خبرة');
  }
  if (inCourse) {
    level += 8;
    reasons.push('مدعوم بدورة أو مقرر');
  }
  if (matchIndexes.length > 1) {
    level += 7;
    reasons.push('متكرر في أكثر من موضع');
  }
  if (withProficiency) {
    level += 10;
    reasons.push('موصوف بمستوى إجادة');
  }
  if (withNumbers) {
    level += 5;
    reasons.push('مرتبط برقم أو نتيجة');
  }
  if (reasons.length === 0) reasons.push('مذكور في قائمة المهارات فقط دون دليل داعم');

  const evidenceIndex = matchIndexes.find((index) =>
    containsAlias(resume.normalizedSentences[index], PROJECT_MARKERS),
  );
  const chosen = evidenceIndex ?? matchIndexes[0];
  const evidence = resume.sentences[chosen]?.slice(0, 180) ?? null;

  return {
    level: Math.min(95, level),
    evidence,
    reason: `${skill.label}: ${reasons.join('، ')}.`,
  };
}

/* ------------------------------------------------------------------ */
/* درجات وحالات                                                        */
/* ------------------------------------------------------------------ */

/** المهارة المفضلة ليست شرطًا أساسيًا، فيُخفَّض سقفها المطلوب خمس نقاط */
const PREFERRED_DISCOUNT = 5;

function requiredLevelFor(skill: SkillDefinition, group: SkillGroup): number {
  return group === 'core' ? skill.requiredLevel : skill.requiredLevel - PREFERRED_DISCOUNT;
}

function statusFor(current: number, required: number): { status: SkillStatus; statusLabel: string } {
  const ratio = required === 0 ? 1 : current / required;
  if (ratio >= 1) return { status: 'matched', statusLabel: 'متطابق' };
  if (ratio >= 0.85) return { status: 'partial', statusLabel: 'يحتاج تحسين بسيط' };
  if (ratio >= 0.7) return { status: 'partial', statusLabel: 'يحتاج تحسينًا' };
  return { status: 'gap', statusLabel: 'فجوة عالية' };
}

function countWord(count: number, one: string, two: string, many: string): string {
  if (count === 1) return one;
  if (count === 2) return two;
  return `${count} ${many}`;
}

/** ترتيب الفجوات: الأساسية أولًا ثم الأكبر مسافةً عن المطلوب */
function rankGaps(skills: SkillFinding[]): SkillFinding[] {
  return skills
    .filter((skill) => skill.status === 'gap')
    .sort((a, b) => {
      if (a.group !== b.group) return a.group === 'core' ? -1 : 1;
      return b.required - b.current - (a.required - a.current);
    });
}

/* ------------------------------------------------------------------ */
/* اقتراحات السيرة                                                     */
/* ------------------------------------------------------------------ */

const WEAK_VERBS = ['عملت علي', 'شاركت في', 'قمت ب', 'ساعدت في', 'كان لدي'];

/** يعثر على سطر قسم معيّن في السيرة: السطر التالي للعنوان، أو السطر الذي يحوي العنوان */
function findSectionLine(resume: ResumeSignals, heading: string): string | null {
  const headingIndex = resume.normalizedSentences.findIndex(
    (sentence) => sentence === normalize(heading),
  );
  if (headingIndex >= 0 && resume.sentences[headingIndex + 1]) {
    return resume.sentences[headingIndex + 1];
  }
  const inlineIndex = resume.normalizedSentences.findIndex((sentence) =>
    sentence.includes(normalize(heading)),
  );
  return inlineIndex >= 0 ? resume.sentences[inlineIndex] : null;
}

function buildSuggestions(
  input: AnalysisInput,
  resume: ResumeSignals,
  missingKeywords: string[],
  skills: SkillFinding[],
): ResumeSuggestion[] {
  const suggestions: ResumeSuggestion[] = [];
  const matchedLabels = skills
    .filter((skill) => skill.status === 'matched')
    .map((skill) => skill.label);

  const weakIndex = resume.normalizedSentences.findIndex(
    (sentence) => containsAlias(sentence, WEAK_VERBS) && containsAlias(sentence, PROJECT_MARKERS),
  );

  if (weakIndex >= 0) {
    const weakSentence = resume.sentences[weakIndex];
    const before = `${(weakSentence.split(':').pop() ?? weakSentence).trim()}.`;
    const tools = matchedLabels.slice(0, 2).join(' و') || 'الأدوات التي تتقنها';
    suggestions.push({
      id: 'project-impact',
      title: 'أعد صياغة وصف المشروع بأثر واضح',
      target: 'قسم المشاريع',
      before,
      after: input.opportunity.isDemo
        ? 'حللت بيانات مبيعات تجريبية باستخدام Python وExcel، وأنشأت لوحة مؤشرات تعرض الاتجاهات الشهرية وأعلى المنتجات أداءً.'
        : `حلّلت بيانات المشروع باستخدام ${tools}، وأنتجت مخرجًا واضحًا يعرض النتيجة الأهم — أضف رقمًا واحدًا يوضح الحجم أو الأثر.`,
      why: 'الأفعال العامة مثل «عملت على» لا تُظهر دورك. الفعل الدقيق مع الأداة والنتيجة يجعل السطر قابلًا للتقييم في ثوانٍ.',
    });
  }

  // لا يوجد فعل ضعيف نصلحه، لكن الأثر غير مذكور بالأرقام
  if (weakIndex < 0 && !resume.hasQuantifiedImpact) {
    const sample = resume.projectSentences.length
      ? (resume.sentences.find((sentence) => normalize(sentence).includes(resume.projectSentences[0])) ??
        resume.sentences[0])
      : null;
    suggestions.push({
      id: 'quantify-impact',
      title: 'أضف رقمًا واحدًا يوضح حجم عملك أو أثره',
      target: 'قسم المشاريع',
      before: sample ?? 'وصف مشروع بلا أرقام.',
      after: `${(sample ?? 'نفّذت المشروع').replace(/\.$/, '')} — بمعالجة ٠٠٠ صف بيانات وإنتاج ٣ مؤشرات، مع تحسّن قدره ٠٠٪ (استبدل الأرقام بأرقامك الحقيقية).`,
      why: 'الرقم يحوّل الجملة من ادّعاء إلى دليل، ويجعل المُراجع يقدّر حجم ما أنجزته خلال ثوانٍ.',
    });
  }

  const keywordsToAdd =
    missingKeywords.length > 0
      ? missingKeywords
      : skills.filter((skill) => skill.status === 'gap').map((skill) => skill.label);

  if (keywordsToAdd.length > 0) {
    const skillsLine = findSectionLine(resume, 'المهارات');
    suggestions.push({
      id: 'skills-keywords',
      title: 'حدّث قسم المهارات بالكلمات المطلوبة في الإعلان',
      target: 'قسم المهارات',
      before: skillsLine ?? 'لا يوجد قسم مهارات واضح في السيرة.',
      after: skillsLine
        ? `${skillsLine.replace(/[.،]\s*$/, '')}، ${keywordsToAdd.join('، ')}.`
        : `المهارات: ${keywordsToAdd.join('، ')}.`,
      why: 'فارز الطلبات يبحث عن مطابقة نصية مباشرة مع الإعلان. أضف الكلمة بعد أن يصبح لديك مشروع يثبتها، حتى تبقى السيرة متسقة.',
    });
  }

  const summaryLine =
    resume.sentences.find((sentence) => normalize(sentence).includes('ابحث عن')) ??
    findSectionLine(resume, 'نبذة');
  const basis = matchedLabels.slice(0, 3).join(' و');
  suggestions.push({
    id: 'summary-line',
    title: 'اجعل النبذة موجّهة لهذه الفرصة تحديدًا',
    target: 'النبذة التعريفية',
    before: summaryLine ?? 'لا توجد نبذة تعريفية في أعلى السيرة.',
    after: `${input.student.major ? `طالب/ة ${input.student.major}` : 'طالب/ة جامعي'} أستهدف تدريبًا تعاونيًا في ${
      input.student.targetField || 'المجال المستهدف'
    }${basis ? `، ولدي أساس عملي في ${basis}` : ''}، ومشروع تطبيقي أعرض فيه طريقة عملي على البيانات من السؤال حتى النتيجة.`,
    why: 'النبذة الموجّهة تُخبر القارئ خلال سطر واحد بأن سيرتك مكتوبة لهذه الفرصة لا لفرصة عامة.',
  });

  return suggestions;
}

/* ------------------------------------------------------------------ */
/* المحرك الرئيسي                                                      */
/* ------------------------------------------------------------------ */

export interface AnalyzeOptions {
  /**
   * مستويات مهارات جاهزة تُستخدم في السيناريو التجريبي فقط،
   * لتثبيت أرقام العرض. الإدخال الحقيقي يتركها فارغة.
   */
  levelOverrides?: Record<string, number>;
}

/**
 * تحليل محلي بالكامل داخل المتصفح.
 * لا يوجد نموذج ذكاء اصطناعي ولا طلب شبكة هنا.
 * نقطة الاستبدال المستقبلية: POST /api/analyze بنفس المدخلات والمخرجات.
 */
export function analyzeProfile(input: AnalysisInput, options: AnalyzeOptions = {}): AnalysisResult {
  const { requirements, keywords } = collectRequirements(input.opportunity.description);
  const resume = readResume(input.resume.text);
  const overrides = options.levelOverrides ?? {};

  const skills: SkillFinding[] = requirements.map(({ skill, group }) => {
    const assessment = assessSkill(skill, resume);
    const override = overrides[skill.id];
    const current = typeof override === 'number' ? override : assessment.level;
    const required = requiredLevelFor(skill, group);
    const { status, statusLabel } = statusFor(current, required);

    return {
      id: skill.id,
      label: skill.label,
      group,
      current,
      required,
      status,
      statusLabel: status === 'matched' ? 'متطابق' : statusLabel,
      reason: assessment.reason,
      evidence: assessment.evidence,
      recommendation: skill.recommendation,
    };
  });

  skills.sort((a, b) => {
    const order: Record<SkillStatus, number> = { matched: 0, partial: 1, gap: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return b.current - a.current;
  });

  const missingKeywords = keywords.filter(
    (keyword) => !containsAlias(resume.normalized, [keyword]),
  );

  /* --- جاهزية السيرة --- */
  let resumeReadiness = 100;
  resumeReadiness -= missingKeywords.length * 5;
  if (!resume.hasQuantifiedImpact) resumeReadiness -= 6;
  if (!resume.hasProjects) resumeReadiness -= 12;
  if (!resume.hasSkillsSection) resumeReadiness -= 8;
  if (resume.wordCount < 80) resumeReadiness -= 10;
  resumeReadiness = Math.max(0, Math.min(100, resumeReadiness));

  /* --- مكوّنات الدرجة --- */
  const coreSkills = skills.filter((skill) => skill.group === 'core');
  const preferredSkills = skills.filter((skill) => skill.group === 'preferred');

  const coverage = (list: SkillFinding[]) =>
    list.length === 0
      ? 0
      : list.reduce((sum, skill) => sum + Math.min(1, skill.current / skill.required), 0) / list.length;

  const coreCoverage = coverage(coreSkills);
  const preferredCoverage = coverage(preferredSkills);

  /**
   * وزن فئة لا يمكن قياسها لا يُمنح مجانًا: إذا خلا الإعلان من المهارات المفضلة
   * يُضاف وزنها إلى الأساسية والعكس، وإذا خلا من الاثنتين يسقط الوزنان معًا.
   */
  const hasCore = coreSkills.length > 0;
  const hasPreferred = preferredSkills.length > 0;
  let coreWeight = 45;
  let preferredWeight = 20;
  if (hasCore && !hasPreferred) {
    coreWeight = 65;
    preferredWeight = 0;
  } else if (!hasCore && hasPreferred) {
    coreWeight = 0;
    preferredWeight = 65;
  }

  let evidenceScore = 0;
  const evidenceNotes: string[] = [];
  if (resume.hasProjects) {
    evidenceScore += 0.4;
    evidenceNotes.push('يوجد مشروع واحد على الأقل');
  } else {
    evidenceNotes.push('لا يوجد مشروع واضح');
  }
  if (skills.some((skill) => skill.evidence && containsAlias(normalize(skill.evidence), PROJECT_MARKERS))) {
    evidenceScore += 0.15;
    evidenceNotes.push('الأدوات مذكورة داخل المشروع');
  }
  if (resume.hasQuantifiedImpact) {
    evidenceScore += 0.3;
    evidenceNotes.push('الأثر مذكور بالأرقام');
  } else {
    evidenceNotes.push('الأثر غير مذكور بالأرقام');
  }
  if (resume.hasLink) {
    evidenceScore += 0.15;
    evidenceNotes.push('يوجد رابط لمعرض الأعمال');
  } else {
    evidenceNotes.push('لا يوجد رابط لمعرض الأعمال');
  }
  evidenceScore = Math.min(1, evidenceScore);

  const normalizedAd = normalize(input.opportunity.description);
  const cityMatch =
    !input.opportunity.city ||
    !input.student.city ||
    normalize(input.student.city) === normalize(input.opportunity.city) ||
    normalizedAd.includes('عن بعد');
  const gradYear = Number(input.student.gradYear);
  const gradWindow = Number.isFinite(gradYear) && gradYear >= new Date().getFullYear();
  const startTermStated = containsAlias(normalizedAd, START_TERM_MARKERS);

  let conditions = 0;
  const conditionNotes: string[] = [];
  if (cityMatch) {
    conditions += 0.35;
    conditionNotes.push('المدينة متوافقة');
  } else {
    conditionNotes.push('المدينة مختلفة عن مقر الفرصة');
  }
  if (input.student.degree) {
    conditions += 0.25;
    conditionNotes.push('المرحلة الدراسية مناسبة');
  }
  if (gradWindow) {
    conditions += 0.25;
    conditionNotes.push('سنة التخرج ضمن نطاق التدريب التعاوني');
  } else {
    conditionNotes.push('سنة التخرج خارج النطاق أو غير مكتملة');
  }
  if (startTermStated) {
    conditions += 0.15;
    conditionNotes.push('موعد بدء التدريب محدد في الإعلان');
  } else {
    conditionNotes.push('الإعلان لا يحدد موعد بدء التدريب، لذلك بقي التوافق الزمني غير مؤكد');
  }

  const components: ScoreComponent[] = [
    {
      key: 'core',
      label: 'المهارات الأساسية',
      weight: coreWeight,
      achieved: coreCoverage,
      note: coreSkills.length
        ? `${coreSkills.filter((s) => s.status === 'matched').length} من ${coreSkills.length} مهارات أساسية بلغت المستوى المطلوب.${
            coreWeight > 45 ? ' لم يذكر الإعلان مهارات مفضلة، فأُضيف وزنها هنا.' : ''
          }`
        : 'لم نستخرج مهارات أساسية من الإعلان، فلم تُحتسب هذه النقاط.',
    },
    {
      key: 'preferred',
      label: 'المهارات المفضلة',
      weight: preferredWeight,
      achieved: preferredCoverage,
      note: preferredSkills.length
        ? `${preferredSkills.length} مهارات مفضلة، سقفها المطلوب أقل من الأساسية بخمس نقاط.${
            preferredWeight > 20 ? ' لم يذكر الإعلان مهارات أساسية، فأُضيف وزنها هنا.' : ''
          }`
        : 'لم يذكر الإعلان مهارات مفضلة، فلم تُحتسب هذه النقاط.',
    },
    {
      key: 'evidence',
      label: 'أدلة المشاريع والخبرة',
      weight: 15,
      achieved: evidenceScore,
      note: `${evidenceNotes.join('، ')}.`,
    },
    {
      key: 'resume',
      label: 'جاهزية السيرة',
      weight: 10,
      achieved: resumeReadiness / 100,
      note: `${missingKeywords.length} كلمات مفتاحية ناقصة من متطلبات الإعلان.`,
    },
    {
      key: 'conditions',
      label: 'توافق الشروط العامة',
      weight: 10,
      achieved: conditions,
      note: `${conditionNotes.join('، ')}.`,
    },
  ];

  const score = Math.round(
    components.reduce((sum, component) => sum + component.weight * component.achieved, 0),
  );

  /* --- السرد --- */
  const gaps = rankGaps(skills);
  const matchedCore = coreSkills.filter((skill) => skill.status === 'matched');
  const partials = skills.filter((skill) => skill.status === 'partial');

  const strengths: string[] = [];
  if (matchedCore.length) {
    strengths.push(`لديك أساس جيد في ${matchedCore.map((skill) => skill.label).join(' و')}.`);
  }
  if (resume.hasProjects) {
    const academic = resume.projectSentences.some(
      (sentence) => sentence.includes('جامعي') || sentence.includes('مقرر') || sentence.includes('جامعه'),
    );
    strengths.push(
      `لديك مشروع${academic ? ' جامعي' : ''} يدعم خبرتك في ${
        input.student.targetField || 'المجال المستهدف'
      }.`,
    );
  }
  if (resume.hasCourses) strengths.push('الدورات المذكورة تدعم جدّيتك في بناء المهارة.');
  if (partials.length) {
    strengths.push(`${partials.map((skill) => skill.label).join(' و')} قريب من المستوى المطلوب.`);
  }
  if (strengths.length === 0) strengths.push('البيانات المدخلة قليلة، أضف مهاراتك ومشاريعك لتظهر نقاط قوتك.');

  const weaknesses: string[] = [];
  if (gaps[0]) weaknesses.push(`مستوى ${gaps[0].label} أقل من المطلوب.`);
  if (!resume.hasQuantifiedImpact) weaknesses.push('السيرة لا توضح أثر المشروع بالأرقام.');
  if (gaps[1]) weaknesses.push(`مهارة ${gaps[1].label} تحتاج إلى دليل أقوى في السيرة.`);
  if (missingKeywords.length) {
    weaknesses.push(
      `تنقص السيرة ${countWord(missingKeywords.length, 'كلمة مفتاحية واحدة', 'كلمتان مفتاحيتان', 'كلمات مفتاحية')} يبحث عنها فارز الطلبات.`,
    );
  }
  if (!resume.hasLink) weaknesses.push('لا يوجد رابط لمعرض أعمال أو مستودع يعرض عملك.');

  const band: AnalysisResult['band'] =
    score >= 80
      ? { id: 'strong', label: 'تطابق قوي', message: 'ملفك قريب جدًا من متطلبات الفرصة، ركّز على تلميع السيرة قبل التقديم.' }
      : score >= 65
        ? {
            id: 'good',
            label: 'تطابق جيد',
            message: `لديك أساس قوي، وتحتاج إلى تطوير ${countWord(
              Math.max(gaps.length, 1),
              'مهارة واحدة',
              'مهارتين',
              'مهارات',
            )} قبل التقديم.`,
          }
        : {
            id: 'building',
            label: 'تحتاج إلى بناء أساس',
            message: 'الفجوة الحالية كبيرة لكنها قابلة للسد، ابدأ بأهم مهارة واحدة ثم أعد التحليل.',
          };

  const warnings: AnalysisWarning[] = [];
  if (input.resume.text.trim().length < 150) {
    warnings.push({
      id: 'thin-resume',
      title: 'ملف ناقص',
      body: 'نص السيرة قصير، لذلك بعض المهارات قد تظهر كفجوة رغم امتلاكك لها. الصق نصًا أوفى يتضمن المهارات والمشاريع والدورات.',
    });
  }
  if (requirements.length === 0 || input.opportunity.description.trim().length < 100) {
    warnings.push({
      id: 'thin-opportunity',
      title: 'إعلان بدون متطلبات كافية',
      body: 'لم نتمكن من استخراج متطلبات واضحة من الإعلان، لذلك الدرجة تقديرية جدًا. الصق قسم المتطلبات كاملًا لنتيجة أدق.',
    });
  }

  return {
    score,
    band,
    skills,
    strengths,
    weaknesses,
    components,
    resumeReadiness,
    missingKeywords,
    suggestions: buildSuggestions(input, resume, missingKeywords, skills),
    warnings,
    topGapId: gaps[0]?.id ?? null,
    isDemo: input.opportunity.isDemo,
    generatedAt: new Date().toISOString(),
  };
}
