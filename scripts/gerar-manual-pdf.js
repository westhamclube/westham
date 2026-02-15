/**
 * Gera MANUAL_ADMIN.pdf a partir do HTML usando Puppeteer.
 * Execute: node scripts/gerar-manual-pdf.js
 */
const path = require('path');
const puppeteer = require('puppeteer');

const htmlPath = path.resolve(__dirname, '..', 'docs', 'MANUAL_ADMIN.html');
const pdfPath = path.resolve(__dirname, '..', 'docs', 'MANUAL_ADMIN.pdf');
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 10000 });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
    console.log('PDF gerado com sucesso:', pdfPath);
  } catch (err) {
    console.error('Erro:', err.message);
    console.log('\nAlternativa: abra docs/MANUAL_ADMIN.html e use Ctrl+P > Salvar como PDF');
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
