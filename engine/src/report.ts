/** 面向 AI 与人的问题报告：stdout 只打印精简摘要，完整内容写 JSON */
import type { Issue } from './issues.ts';

const ICON = { error: '✖', warning: '▲' } as const;

export function formatIssue(i: Issue): string {
  const loc = [i.file && (i.line ? `${i.file}:${i.line}` : i.file), i.scene && `scene=${i.scene}`, i.state !== undefined && `state=${i.state}`, i.step !== undefined && `step=${i.step}`, i.object && `object=${i.object}`]
    .filter(Boolean)
    .join(' ');
  return `${ICON[i.level]} [${i.code}] ${i.message}${loc ? `\n    @ ${loc}` : ''}${i.hint ? `\n    → ${i.hint}` : ''}`;
}

/** 打印摘要：error 全部显示（最多 15 条），warning 最多 8 条 */
export function printIssues(issues: Issue[], maxErr = 15, maxWarn = 8) {
  const errs = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warning');
  for (const i of errs.slice(0, maxErr)) console.log(formatIssue(i));
  if (errs.length > maxErr) console.log(`  … 另有 ${errs.length - maxErr} 个 error（见报告 JSON）`);
  for (const i of warns.slice(0, maxWarn)) console.log(formatIssue(i));
  if (warns.length > maxWarn) console.log(`  … 另有 ${warns.length - maxWarn} 个 warning（见报告 JSON）`);
}
