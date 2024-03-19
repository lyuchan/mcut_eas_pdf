const { PDFDocument, PDFName } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// 输入文件夹路径
const inputFolderPath = './pdf_in';

// 输出文件夹路径
const outputFolderPath = './temp';
let oldnum = 0;
// 创建输出文件夹
if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
}

const splitPDFsInFolder = async () => {
    try {
        // 读取输入文件夹中的所有文件
        const files = fs.readdirSync(inputFolderPath);

        // 过滤出 PDF 文件
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));

        // 遍历每个 PDF 文件
        for (const pdfFile of pdfFiles) {
            const inputFilePath = path.join(inputFolderPath, pdfFile);

            // 读取输入PDF文件
            const inputFileBytes = fs.readFileSync(inputFilePath);
            const pdfDoc = await PDFDocument.load(inputFileBytes);

            // 获取PDF文件的页数
            const numPages = pdfDoc.getPageCount();

            // 拆分每一页并保存为单独的文件

            for (let i = 0; i < numPages; i++) {
                // 创建一个新的PDF文档
                const newPDFDoc = await PDFDocument.create();
                const [copiedPage] = await newPDFDoc.copyPages(pdfDoc, [i]);
                newPDFDoc.addPage(copiedPage);

                // 生成输出文件路径，使用 1、2、3、... 的顺序命名
                const outputFileName = `${i + 1 + oldnum}.pdf`;
                const outputFilePath = path.join(outputFolderPath, outputFileName);

                // 将新的PDF文档保存到文件
                const pdfBytes = await newPDFDoc.save();
                fs.writeFileSync(outputFilePath, pdfBytes);
                console.log(`Page ${i + 1} of ${pdfFile} saved to ${outputFilePath}`);
            }
            oldnum += numPages
        }
        console.log('Splitting complete!');
    } catch (error) {
        console.error('Error splitting PDFs:', error);
    }
};

splitPDFsInFolder();
