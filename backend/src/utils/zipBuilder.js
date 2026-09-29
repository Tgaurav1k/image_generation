const archiver = require('archiver');
const XLSX = require('xlsx');

async function buildDownloadZip(imageRows, res) {
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="images_download.zip"');

  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.pipe(res);

  imageRows.forEach((img) => {
    archive.append(img.image_data, { name: img.image_name });
  });

  const wb = XLSX.utils.book_new();
  const wsData = [
    ['Prompt Text', 'Image File Name'],
    ...imageRows.map(img => [img.prompt, img.image_name]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Downloads');
  const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  archive.append(excelBuffer, { name: 'prompts.xlsx' });
  await archive.finalize();
}

module.exports = { buildDownloadZip };
