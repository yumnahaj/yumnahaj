import type { StudentProfile } from '../types';

/** يختار صيغة المخاطبة المناسبة دون افتراض جنس المستخدم */
export function voiced(student: Pick<StudentProfile, 'voice'>, feminine: string, neutral: string): string {
  return student.voice === 'feminine' ? feminine : neutral;
}

export function formatMinutes(total: number): string {
  if (total <= 0) return '0 دقيقة';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} دقيقة`;
  const hourLabel = hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : `${hours} ساعات`;
  if (minutes === 0) return hourLabel;
  return `${hourLabel} و${minutes} دقيقة`;
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* المتصفح منع الوصول إلى الحافظة، نكمل بالطريقة البديلة */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.insetInlineStart = '-9999px';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}
