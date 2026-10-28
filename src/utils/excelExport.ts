/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Exports data to an Excel-compatible CSV file with UTF-8 BOM
 * This opens cleanly in Microsoft Excel without character encoding issues.
 */
export function exportToExcel<T>(
  filename: string,
  data: T[],
  columns: { header: string; key: keyof T | ((item: T) => unknown) }[]
) {
  if (!data || data.length === 0) {
    console.warn('No data available to export.');
    return;
  }

  // Create header row
  const headerRow = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // Create data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val: unknown;
        if (typeof col.key === 'function') {
          val = col.key(item);
        } else {
          val = item[col.key];
        }

        if (val === null || val === undefined) {
          return '""';
        }
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      })
      .join(',');
  });

  // Prepend UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
