console.log('hola mundo PI')

const { exec } = require("child_process");

exec("i2cset -y 1 0x10 $i 0xff", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});