const { exec } = require('child_process');

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
});
