import fs from 'fs';

// 源文件路径
const sourcePath = '.env.development';
// 目标文件路径
const server_targetPath = './server/.env.development';
const collector_targetPath = './collector/.env.development';

// 复制文件并覆盖目标文件
fs.copyFile(sourcePath, server_targetPath, (err) => {
    if (err) {
        console.error('env copy error:', err);
    } else {
        console.log('env copy done for /server/.env.development');
    }
});

fs.copyFile(sourcePath, collector_targetPath, (err) => {
    if (err) {
        console.error('env copy error:', err);
    } else {
        console.log('env copy done for /collector/.env.development');
    }
});