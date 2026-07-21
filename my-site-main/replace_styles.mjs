import fs from 'fs';
import path from 'path';

const dir = './components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx'); // Add App.tsx to the list

const replacements = [
    { from: /#1c1c1e/g, to: 'zinc-950' },
    { from: /#1d1d1f/g, to: 'zinc-900' },
    { from: /#000000/g, to: 'zinc-950' },
    { from: /#F5F5F7/g, to: 'zinc-50' },
    { from: /#0071e3/g, to: 'primary-500' },
    { from: /#0077ed/g, to: 'primary-600' },
    { from: /#2997ff/g, to: 'primary-400' },
    { from: /#050505/g, to: 'zinc-950' },
    { from: /bg-slate-50/g, to: 'bg-zinc-50' },
    { from: /bg-slate-100/g, to: 'bg-zinc-100' },
    { from: /bg-slate-200/g, to: 'bg-zinc-200' },
    { from: /text-slate-400/g, to: 'text-zinc-400' },
    { from: /text-slate-500/g, to: 'text-zinc-500' },
    { from: /text-slate-600/g, to: 'text-zinc-600' },
    { from: /border-slate-100/g, to: 'border-zinc-200' },
    { from: /border-slate-200/g, to: 'border-zinc-200' },
    { from: /border-white\/5/g, to: 'border-zinc-800' },
    { from: /border-white\/10/g, to: 'border-zinc-800' },
    { from: /bg-white\/5/g, to: 'bg-zinc-900' },
    { from: /bg-white\/10/g, to: 'bg-zinc-800' },
    { from: /dark:bg-black/g, to: 'dark:bg-zinc-950' },
    { from: /bg-black/g, to: 'bg-zinc-950' },
    { from: /rounded-2xl/g, to: 'rounded-xl' },
    { from: /rounded-3xl/g, to: 'rounded-xl' },
    { from: /rounded-\[2rem\]/g, to: 'rounded-xl' },
    { from: /rounded-\[3rem\]/g, to: 'rounded-xl' },
    { from: /shadow-xl/g, to: 'shadow-sm' },
    { from: /shadow-2xl/g, to: 'shadow-md' },
    { from: /shadow-blue-500\/30/g, to: 'shadow-primary-500/20' },
    { from: /shadow-blue-500\/5/g, to: 'shadow-primary-500/5' },
    { from: /text-blue-500/g, to: 'text-primary-500' },
    { from: /text-blue-600/g, to: 'text-primary-600' },
    { from: /bg-blue-500/g, to: 'bg-primary-500' },
    { from: /bg-blue-600/g, to: 'bg-primary-600' },
    { from: /bg-blue-50/g, to: 'bg-primary-500/10' },
    { from: /border-blue-500/g, to: 'border-primary-500' },
    { from: /border-blue-200/g, to: 'border-primary-200' },
    { from: /fill-blue-500/g, to: 'fill-primary-500' },
    { from: /hover:bg-blue-500/g, to: 'hover:bg-primary-500' },
    { from: /hover:bg-blue-600/g, to: 'hover:bg-primary-600' },
    { from: /hover:text-blue-500/g, to: 'hover:text-primary-500' },
    { from: /hover:text-blue-600/g, to: 'hover:text-primary-600' }
];

files.forEach(file => {
    let filePath = file.startsWith('..') ? path.join(dir, file) : path.join(dir, file);
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content;
        replacements.forEach(r => {
            newContent = newContent.replace(r.from, r.to);
        });
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated ${file}`);
        }
    } catch(e) {
        console.error(`Skipping ${file}: ${e}`);
    }
});
