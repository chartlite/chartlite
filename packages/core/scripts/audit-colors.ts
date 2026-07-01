/**
 * Color Contrast Audit Script
 *
 * Audits all theme colors for WCAG 2.1 AA compliance
 * Generates a detailed report in docs/CONTRAST_AUDIT.md
 */

import { getContrastRatio, auditContrast, formatRatio, type ContrastAuditResult } from '../src/utils/contrastChecker';

// Import theme colors (manual copy to avoid build issues)
const themes = {
  default: {
    background: '#ffffff',
    foreground: '#f9fafb',
    primary: '#3b82f6',
    grid: '#e5e7eb',
    text: '#1f2937',
    seriesColors: [
      '#3b82f6', // blue-500 (3.68:1) ✅
      '#059669', // emerald-600 (4.04:1) ✅ [fixed]
      '#d97706', // amber-600 (3.02:1) ✅ [fixed]
      '#ef4444', // red-500 (3.76:1) ✅
      '#8b5cf6', // violet-500 (4.23:1) ✅
      '#ec4899', // pink-500 (3.53:1) ✅
      '#0891b2', // cyan-600 (3.58:1) ✅ [fixed]
      '#ea580c', // orange-600 (3.39:1) ✅ [fixed]
    ],
  },
  midnight: {
    background: '#0f172a',
    foreground: '#1e293b',
    primary: '#60a5fa',
    grid: '#334155',
    text: '#f1f5f9',
    seriesColors: [
      '#60a5fa', // blue-400 (7.02:1) ✅
      '#34d399', // green-400 (9.29:1) ✅
      '#fbbf24', // amber-400 (10.69:1) ✅
      '#f87171', // red-400 (6.45:1) ✅
      '#a78bfa', // violet-400 (6.56:1) ✅
      '#f472b6', // pink-400 (6.74:1) ✅
      '#22d3ee', // cyan-400 (9.88:1) ✅
      '#fb923c', // orange-400 (7.89:1) ✅
    ],
  },
  minimal: {
    background: '#ffffff',
    foreground: '#fafafa',
    primary: '#000000',
    grid: '#e5e5e5',
    text: '#171717',
    seriesColors: [
      '#000000', // black (21.00:1) ✅
      '#525252', // gray-600 (7.81:1) ✅
      '#737373', // gray-500 (4.74:1) ✅
      '#595959', // gray-550 (6.39:1) ✅ [fixed]
      '#171717', // gray-900 (17.93:1) ✅
      '#404040', // gray-700 (10.37:1) ✅
      '#262626', // gray-800 (15.13:1) ✅
      '#8a8a8a', // gray-450 (3.62:1) ✅ [fixed]
    ],
  },
};

interface ThemeAudit {
  theme: string;
  textContrast: ContrastAuditResult;
  primaryContrast: ContrastAuditResult;
  gridContrast: ContrastAuditResult;
  seriesContrasts: ContrastAuditResult[];
  passes: boolean;
  failureCount: number;
}

function auditTheme(themeName: string, theme: any): ThemeAudit {
  const textContrast = auditContrast(theme.text, theme.background);
  const primaryContrast = auditContrast(theme.primary, theme.background);
  const gridContrast = auditContrast(theme.grid, theme.background);

  const seriesContrasts = theme.seriesColors.map((color: string) =>
    auditContrast(color, theme.background)
  );

  // Count failures (normal text should be AA, UI components should pass 3:1)
  let failureCount = 0;
  if (textContrast.normalText === 'Fail') failureCount++;
  if (primaryContrast.uiComponent === 'Fail') failureCount++;
  if (gridContrast.uiComponent === 'Fail') failureCount++;

  seriesContrasts.forEach((result: ContrastAuditResult) => {
    if (result.uiComponent === 'Fail') failureCount++;
  });

  return {
    theme: themeName,
    textContrast,
    primaryContrast,
    gridContrast,
    seriesContrasts,
    passes: failureCount === 0,
    failureCount,
  };
}

function formatAuditResult(result: ContrastAuditResult, label: string, isText: boolean = false): string[] {
  const status = isText
    ? result.normalText === 'AA' || result.normalText === 'AAA'
      ? '✅ PASS'
      : '❌ FAIL'
    : result.uiComponent === 'Pass'
      ? '✅ PASS'
      : '❌ FAIL';

  const rating = isText ? result.normalText : result.uiComponent;

  return [
    `### ${label}`,
    `- **Color**: \`${result.color}\``,
    `- **Background**: \`${result.background}\``,
    `- **Contrast Ratio**: ${formatRatio(result.ratio)}`,
    `- **Normal Text**: ${result.normalText}`,
    `- **Large Text**: ${result.largeText}`,
    `- **UI Component**: ${result.uiComponent}`,
    `- **Status**: ${status}`,
    '',
  ];
}

function generateMarkdownReport(audits: ThemeAudit[]): string {
  const lines: string[] = [
    '# Color Contrast Audit Report',
    '',
    '**Generated**: ' + new Date().toLocaleDateString(),
    '**WCAG Version**: 2.1',
    '**Compliance Level**: AA',
    '',
    '## Summary',
    '',
    '| Theme | Status | Failures | Text | Primary | Grid | Series Colors |',
    '|-------|--------|----------|------|---------|------|---------------|',
  ];

  audits.forEach((audit) => {
    const status = audit.passes ? '✅ PASS' : '❌ FAIL';
    const textStatus = audit.textContrast.normalText !== 'Fail' ? '✅' : '❌';
    const primaryStatus = audit.primaryContrast.uiComponent === 'Pass' ? '✅' : '❌';
    const gridStatus = audit.gridContrast.uiComponent === 'Pass' ? '✅' : '❌';
    const seriesPass = audit.seriesContrasts.filter((r: ContrastAuditResult) => r.uiComponent === 'Pass').length;
    const seriesTotal = audit.seriesContrasts.length;
    const seriesStatus = seriesPass === seriesTotal ? '✅' : '⚠️';

    lines.push(
      `| ${audit.theme} | ${status} | ${audit.failureCount} | ${textStatus} | ${primaryStatus} | ${gridStatus} | ${seriesStatus} ${seriesPass}/${seriesTotal} |`
    );
  });

  lines.push('', '---', '');

  // Detailed results for each theme
  audits.forEach((audit) => {
    lines.push(`## ${audit.theme.charAt(0).toUpperCase() + audit.theme.slice(1)} Theme`);
    lines.push('');
    lines.push(`**Overall**: ${audit.passes ? '✅ **PASS** - Fully WCAG AA compliant' : '❌ **FAIL** - ' + audit.failureCount + ' failure(s)'}`);
    lines.push('');

    // Text contrast
    lines.push(...formatAuditResult(audit.textContrast, 'Text Color', true));

    // Primary color
    lines.push(...formatAuditResult(audit.primaryContrast, 'Primary Color', false));

    // Grid color
    lines.push(...formatAuditResult(audit.gridContrast, 'Grid Color', false));

    // Series colors
    lines.push('### Series Colors');
    lines.push('');
    audit.seriesContrasts.forEach((result: ContrastAuditResult, index: number) => {
      const status = result.uiComponent === 'Pass' ? '✅' : '❌';
      lines.push(
        `${index + 1}. \`${result.color}\` - ${formatRatio(result.ratio)} - ${result.uiComponent} ${status}`
      );
    });
    lines.push('');
    lines.push('---');
    lines.push('');
  });

  // WCAG Requirements section
  lines.push('## WCAG 2.1 AA Requirements');
  lines.push('');
  lines.push('### Contrast Ratios');
  lines.push('- **Normal text** (< 18pt): Minimum 4.5:1');
  lines.push('- **Large text** (>= 18pt or bold >= 14pt): Minimum 3:1');
  lines.push('- **UI components** (chart lines, bars, etc.): Minimum 3:1');
  lines.push('');
  lines.push('### Grading');
  lines.push('- **AAA**: Exceeds requirements (7:1 for normal text, 4.5:1 for large text)');
  lines.push('- **AA**: Meets requirements (4.5:1 for normal text, 3:1 for large text)');
  lines.push('- **Fail**: Does not meet WCAG AA');
  lines.push('');

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');

  const failingThemes = audits.filter((a) => !a.passes);
  if (failingThemes.length === 0) {
    lines.push('✅ **All themes pass WCAG AA compliance!**');
    lines.push('');
    lines.push('No changes needed. All colors have sufficient contrast for accessibility.');
  } else {
    lines.push('❌ **Some themes have contrast issues:**');
    lines.push('');

    failingThemes.forEach((audit) => {
      lines.push(`### ${audit.theme} Theme`);
      lines.push('');

      if (audit.textContrast.normalText === 'Fail') {
        lines.push(`- **Text color** (\`${audit.textContrast.color}\`) fails contrast. Suggest making it darker/lighter.`);
      }

      if (audit.primaryContrast.uiComponent === 'Fail') {
        lines.push(`- **Primary color** (\`${audit.primaryContrast.color}\`) fails contrast. Suggest adjusting.`);
      }

      if (audit.gridContrast.uiComponent === 'Fail') {
        lines.push(`- **Grid color** (\`${audit.gridContrast.color}\`) fails contrast. Consider making it more visible or accept as subtle.`);
      }

      const failingSeries = audit.seriesContrasts.filter((r: ContrastAuditResult) => r.uiComponent === 'Fail');
      if (failingSeries.length > 0) {
        lines.push('- **Series colors** with insufficient contrast:');
        failingSeries.forEach((result: ContrastAuditResult) => {
          lines.push(`  - \`${result.color}\` (${formatRatio(result.ratio)})`);
        });
      }

      lines.push('');
    });
  }

  lines.push('---');
  lines.push('');
  lines.push('**Report generated by**: `packages/core/scripts/audit-colors.ts`');
  lines.push('**Tools**: WCAG 2.1 contrast ratio calculator');
  lines.push('');

  return lines.join('\n');
}

// Run audit
console.log('🎨 Running color contrast audit...\n');

const audits: ThemeAudit[] = [];

for (const [themeName, theme] of Object.entries(themes)) {
  console.log(`Auditing ${themeName} theme...`);
  const audit = auditTheme(themeName, theme);
  audits.push(audit);

  if (audit.passes) {
    console.log(`  ✅ PASS - All colors meet WCAG AA`);
  } else {
    console.log(`  ❌ FAIL - ${audit.failureCount} color(s) fail WCAG AA`);
  }
}

console.log('\n📊 Generating report...\n');

const report = generateMarkdownReport(audits);

// Output report
console.log(report);

// Write to file (if running in Node environment with fs)
try {
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '../../../docs/CONTRAST_AUDIT.md');
  fs.writeFileSync(outputPath, report);
  console.log(`\n✅ Report saved to: docs/CONTRAST_AUDIT.md`);
} catch (error) {
  console.log('\n⚠️  Could not write report to file (running in browser?)');
}

// Exit with error code if any themes fail
const totalFailures = audits.reduce((sum, audit) => sum + audit.failureCount, 0);
if (totalFailures > 0) {
  console.log(`\n❌ Audit failed: ${totalFailures} color contrast issue(s) found`);
  process.exit(1);
} else {
  console.log('\n✅ All themes pass WCAG AA compliance!');
  process.exit(0);
}
