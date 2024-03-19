const fs = require('fs');
const path = require('path');


deleteFolderRecursive('outtemp')
deleteFolderRecursive('png_code')
deleteFolderRecursive('temp')
// 递归删除目录
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
        //fs.rmdirSync(folderPath); // 删除空目录
        // console.log(`Deleted folder: ${folder
        
    }


}
