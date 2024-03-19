const fs = require('fs');
const PDFParser = require('pdf-parse');
const bwipjs = require('bwip-js');
// 定义 temp 目录路径
const tempDir = './temp/';

// 读取 temp 目录中的所有文件
fs.readdir(tempDir, (err, files) => {
    if (err) {
        console.error('读取目录时出错：', err);
        return;
    }

    // 遍历每个文件名
    files.forEach(file => {
        // 构建完整的文件路径
        const filePath = tempDir + file;

        // 读取 PDF 文件
        fs.readFile(filePath, (err, pdfBuffer) => {
            if (err) {
                console.error('读取文件时出错：', err);
                return;
            }

            // 使用 pdf-parse 解析 PDF
            PDFParser(pdfBuffer).then(data => {
                // 获取 PDF 页面数量
                let assetNumbers = data.text.match(/明志科大\n/g).map(match => { return match });
                let num = assetNumbers.length;
                let ardata = data.text.split("\n");
                for (let i = 0; i < num; i++) {
                    console.log(ardata[i + 2 + num * 2]);
                    const directoryPath = `./png_code/${file.replace(".pdf", "")}`;
                    if (!fs.existsSync(directoryPath)) {
                        // 如果路徑不存在，則創建目錄
                        fs.mkdirSync(directoryPath, { recursive: true }, (err) => {
                            if (err) {
                                console.error('Error creating directory:', err);
                            } else {
                                console.log('Directory created successfully');
                            }
                        });
                    } else {
                      //  console.log('Directory already exists');
                    }

                    generateQRCode(ardata[i + 2 + num * 2], `./png_code/${file.replace(".pdf", "")}/${i}.png`)
                }
                // 可以在这里对每个文件的解析结果执行其他操作
            }).catch(err => {
                console.error('解析 PDF 文件时出错：', err);
            });
        });
    });
});


function generateQRCode(inputString, outputFile) {
    bwipjs.toBuffer({
        bcid: 'qrcode',  // 使用 QR Code 條碼類型
        text: inputString,
        scale: 3,
        includetext: true,  // 在 QR Code 中包含文字
        textxalign: 'center'
    }, function (err, png) {
        if (err) {
            console.log(err);
        } else {
            fs.writeFile(outputFile, png, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('QR Code 已成功生成並保存為 ' + outputFile);
                }
            });
        }
    });
}