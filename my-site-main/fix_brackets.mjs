import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
        .replace(/bg-\[zinc-(\d+)\]/g, 'bg-zinc-$1')
        .replace(/text-\[zinc-(\d+)\]/g, 'text-zinc-$1')
        .replace(/border-\[zinc-(\d+)\]/g, 'border-zinc-$1')
        .replace(/bg-\[primary-(\d+)\]/g, 'bg-primary-$1')
        .replace(/text-\[primary-(\d+)\]/g, 'text-primary-$1')
        .replace(/border-\[primary-(\d+)\]/g, 'border-primary-$1');
    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log("Updated", filePath);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            replaceInFile(fullPath);
        }
    });
}

walkDir('./components');
replaceInFile('./App.tsx');
