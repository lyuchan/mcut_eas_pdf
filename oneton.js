const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const path = require('path');

async function mergePdfs(fileNames, outputFileName) {
    const pdfDocs = await Promise.all(fileNames.map(fileName => PDFDocument.load(fs.readFileSync(fileName))));
    const pdfDoc = await PDFDocument.create();
  
    for (const pdfDocI of pdfDocs) {
        const pages = await pdfDoc.copyPages(pdfDocI, pdfDocI.getPageIndices());
        for (const page of pages) {
            pdfDoc.addPage(page);
        }
    }
  
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFileName, pdfBytes);
}

// 讀取 outtemp 資料夾下的所有檔案
const directoryPath = './outtemp';
fs.readdir(directoryPath, (err, files) => {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    // 只保留 pdf 檔案
    let pdfFiles = files.filter(file => file.endsWith('.pdf')).map(file => path.join(directoryPath, file));

    // 合併 pdf 檔案
    mergePdfs(pdfFiles, './out/merged.pdf')
    .then(() => {
        console.log('PDF files have been merged successfully');
    });
});
