const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path'); // Import path module

async function addImageToPDF(pdfpath) {
    const existingPdfBytes = await fs.readFileSync(pdfpath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // console.log(`./png_code/${pdfpath.replace("./temp/", "").replace(".pdf", "")}/`)
    const watermarkFiles = fs.readdirSync(`./png_code/${pdfpath.replace("./temp/", "").replace(".pdf", "")}/`).map(file => path.join(`./png_code/${pdfpath.replace("./temp/", "").replace(".pdf", "")}/`, file)); // Use path.join to create file paths
    const watermarkImageBytes = watermarkFiles.map(file => fs.readFileSync(file));
    let watermarkImages = []
    for (let i = 0; i < watermarkImageBytes.length; i++) {
        watermarkImages.push(await pdfDoc.embedPng(watermarkImageBytes[i]));
    }
    // console.log(watermarkImages.length)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    for (let i = 0; i < watermarkImages.length; i++) {
        let xnum = 225 + ((i > 4) * (280));
        let ynum = 25 + (160 * ((4 + (5 * (i > 4))) - i));
        firstPage.drawImage(watermarkImages[i], {
            x: xnum,
            y: ynum,
            width: 60,
            height: 60,
        });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(`./outtemp/${pdfpath.replace("./temp/", "")}`, pdfBytes);
}


fs.readdir("./temp/", (err, files) => {
    if (err) {
        console.error('无法读取文件夹:', err);
        return;
    }
    for (let i = 0; i < files.length; i++) {
        addImageToPDF(`./temp/${files[i]}`).catch(err => console.log(err));
    }
});


/*const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs');

async function addImageToPDF() {
    // 读取现有的PDF文件
    const existingPdfBytes = fs.readFileSync('1.pdf');

    // 创建一个新的PDF文档
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const watermarkFiles = fs.readdirSync('./png_code').map(file => path.join('./png_code', file));
    const watermarkImageBytes = watermarkFiles.map(file => fs.readFileSync(file));
    let watermarkImages = []
    for (let i = 0; i < watermarkImageBytes.length; i++) {
        watermarkImages.push(await pdfDoc.embedPng(watermarkImageBytes[i]));
    }
    console.log(watermarkImages.length)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    for (let i = 0; i < 10; i++) {
        let xnum = 225 + ((i > 4) * (280));
        let ynum = 25 + (160 * ((4 + (5 * (i > 4))) - i));
        firstPage.drawImage(watermarkImages[2], {
            x: xnum,
            y: ynum,
            width: 60,
            height: 60,
        });
    }

    // 将更改写入新的PDF文件
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('output.pdf', pdfBytes);
}

addImageToPDF().catch(err => console.log(err));
/*
225,505
665
505
345
185
25
*/