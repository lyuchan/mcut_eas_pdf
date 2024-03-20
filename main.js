/*const { exec } = require('child_process');

// 执行 ntoone.js
exec('node ntoone.js', (err, stdout, stderr) => {
    if (err) {
        console.error(`执行 ntoone.js err`);
        return;
    }


    // 当 ntoone.js 完成后，执行 main.js
    exec('node makeqrcode.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`执行 makeqrcode.js err`);
            return;
        }

        exec('node pdfaddqrcode.js', (err, stdout, stderr) => {
            if (err) {
                console.error(`执行 pdfaddqrcode.js err`);
                return;
            }
            exec('node oneton.js', (err, stdout, stderr) => {
                if (err) {
                    console.error(`执行 oneton.js err`);
                    return;
                }
                exec('node reset.js', (err, stdout, stderr) => {
                    if (err) {
                        console.error(`执行 oneton.js err`);
                        return;
                    }


                });

            });
        });
    });
});*/


const fs = require('fs');
const PDFParser = require('pdf-parse');
const bwipjs = require('bwip-js');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const inputFolderPath = './pdf_in';
if (!fs.existsSync('./pdf_in')) {
    fs.mkdirSync('./pdf_in');
}
if (!fs.existsSync('./pdf_out')) {
    fs.mkdirSync('./pdf_out');
}

if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
}
//多頁轉單頁
const splitPDFsInFolder = async () => {
    const outputFolderPath = './temp/pdf';
    let oldnum = 0;

    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath);
    }
    try {
        const files = fs.readdirSync(inputFolderPath);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        for (const pdfFile of pdfFiles) {
            const inputFilePath = path.join(inputFolderPath, pdfFile);
            const inputFileBytes = fs.readFileSync(inputFilePath);
            const pdfDoc = await PDFDocument.load(inputFileBytes);
            const numPages = pdfDoc.getPageCount();
            for (let i = 0; i < numPages; i++) {
                const newPDFDoc = await PDFDocument.create();
                const [copiedPage] = await newPDFDoc.copyPages(pdfDoc, [i]);
                newPDFDoc.addPage(copiedPage);
                const outputFileName = `${i + 1 + oldnum}.pdf`;
                const outputFilePath = path.join(outputFolderPath, outputFileName);
                const pdfBytes = await newPDFDoc.save();
                fs.writeFileSync(outputFilePath, pdfBytes);
                console.log(`Page ${i + 1} of ${pdfFile} saved to ${outputFilePath}`);
            }
            oldnum += numPages
        }
        console.log('Splitting complete!');
        readpdf()
    } catch (error) {
        console.error('Error splitting PDFs:', error);
    }
};
splitPDFsInFolder()
//生成qrcode
async function readpdf() {
    const pdftempdir = './temp/pdf/';
    fs.readdir(pdftempdir, (err, files) => {
        if (err) {
            console.error('读取目录时出错：', err);
            return;
        }
        files.forEach(file => {
            const filePath = pdftempdir + file;
            fs.readFile(filePath, (err, pdfBuffer) => {
                if (err) {
                    console.error('读取文件时出错：', err);
                    return;
                }
                PDFParser(pdfBuffer).then(data => {
                    let assetNumbers = data.text.match(/明志科大\n/g).map(match => { return match });
                    let num = assetNumbers.length;
                    let ardata = data.text.split("\n");
                    for (let i = 0; i < num; i++) {
                        console.log(ardata[i + 2 + num * 2]);
                        const directoryPath = `./temp/png_code/${file.replace(".pdf", "")}`;
                        if (!fs.existsSync(directoryPath)) {
                            fs.mkdirSync(directoryPath, { recursive: true }, (err) => {
                                if (err) {
                                    console.error('Error creating directory:', err);
                                } else {
                                    console.log('Directory created successfully');
                                }
                            });
                        }
                        generateQRCode(ardata[i + 2 + num * 2], `./temp/png_code/${file.replace(".pdf", "")}/${i}.png`)
                    }

                }).catch(err => {
                    console.error('解析 PDF 文件时出错：', err);
                });
            });
        });
    });
    setTimeout(function () {
        if (!fs.existsSync('./temp/outpdf')) {
            fs.mkdirSync('./temp/outpdf');
        }
        fs.readdir("./temp/pdf/", (err, files) => {
            if (err) {
                console.error('无法读取文件夹:', err);
                return;
            }
            for (let i = 0; i < files.length; i++) {
                addImageToPDF(`./temp/pdf/${files[i]}`).catch(err => console.log(err));
            }
            setTimeout(function () {
                const directoryPath = './temp/outpdf';
                fs.readdir(directoryPath, (err, files) => {
                    if (err) {
                        return console.log('Unable to scan directory: ' + err);
                    }

                    // 只保留 pdf 檔案
                    let pdfFiles = files.filter(file => file.endsWith('.pdf')).map(file => path.join(directoryPath, file));

                    // 合併 pdf 檔案
                    mergePdfs(pdfFiles, './pdf_out/output.pdf')
                        .then(() => {
                            console.log('PDF files have been merged successfully');
                            setTimeout(function () {
                                deleteFolderRecursive('./temp')
                                },3000)
                        });
                       
                });
            }, 1000)
        });
    }, 5000);
}
//壓上去
async function addImageToPDF(pdfpath) {
    const existingPdfBytes = await fs.readFileSync(pdfpath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    // console.log(`./png_code/${pdfpath.replace("./temp/", "").replace(".pdf", "")}/`)
    const watermarkFiles = fs.readdirSync(`./temp/png_code/${pdfpath.replace("./temp/pdf", "").replace(".pdf", "")}/`).map(file => path.join(`./temp/png_code/${pdfpath.replace("./temp/pdf/", "").replace(".pdf", "")}/`, file)); // Use path.join to create file paths
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
    fs.writeFileSync(`./temp/outpdf/${pdfpath.replace("./temp/pdf/", "")}`, pdfBytes);
}

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


function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach(file => {
            const curPath = path.join(folderPath, file);
            if (fs.lstatSync(curPath).isDirectory()) { // 如果是目录，则递归删除
                deleteFolderRecursive(curPath);
            } else { // 如果是文件，则直接删除
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(folderPath); // 删除空目录
        // console.log(`Deleted folder: ${folder
        
    }


}



function generateQRCode(inputString, outputFile) {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'qrcode',  // 使用 QR Code 條碼類型
            text: inputString,
            scale: 3,
            includetext: true,  // 在 QR Code 中包含文字
            textxalign: 'center'
        }, function (err, png) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                fs.writeFile(outputFile, png, function (err) {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        console.log('QR Code 已成功生成並保存為 ' + outputFile);
                        resolve();
                    }
                });
            }
        });
    });
}

