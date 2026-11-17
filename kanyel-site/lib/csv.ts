// Les cellules commençant par ces caractères sont interprétées comme des formules
// par Excel/LibreOffice — un visiteur pourrait saisir "=HYPERLINK(...)" dans un
// formulaire et le faire exécuter quand un admin ouvre l'export (injection CSV).
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(cell: unknown): string {
  let value = String(cell ?? "");
  if (FORMULA_PREFIX.test(value)) value = `'${value}`;
  return `"${value.replace(/"/g, '""')}"`;
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCell).join(",")).join("\n");
}
