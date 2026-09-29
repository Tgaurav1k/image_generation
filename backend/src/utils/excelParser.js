const XLSX = require('xlsx');

function parseExcelPrompts(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const prompts = rows
    .map(row => (row[0] != null ? String(row[0]).trim() : ''))
    .filter(text => text.length > 0);

  return prompts;
}

module.exports = { parseExcelPrompts };
