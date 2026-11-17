// Cells starting with these characters are interpreted as formulas by
// Excel/LibreOffice — a visitor could submit "=HYPERLINK(...)" in a form and
// have it execute when an admin opens the export (CSV injection).
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(cell: unknown): string {
  let value = String(cell ?? "");
  if (FORMULA_PREFIX.test(value)) value = `'${value}`;
  return `"${value.replace(/"/g, '""')}"`;
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\n");
}
