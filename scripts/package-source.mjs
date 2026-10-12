// Package complete corresponding local source, including uncommitted changes.
// Never archive .git, generated outputs, node_modules, credentials or env.local.
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
await mkdir(path.join(root, '.lab-qa'), { recursive: true });
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean);
const extra = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8', windowsHide: true }).split('\0').filter(Boolean);
const files = [...new Set([...tracked, ...extra])].filter(file => !/(^|\/)(\.git|node_modules|\.next|out|coverage|\.lab-qa)(\/|$)|\.env.*\.local$|\.(pem|p8|key|jks|dpapi)$/i.test(file));
if (!files.includes('LICENSE') || !files.includes('FORK-NOTICE.md') || !files.includes('yarn.lock')) throw new Error('Source package is missing required files.');
// Optional local archive. Public builds link GitHub's archive for their exact
// commit, so the complete 177MB source need not be duplicated on the CDN.
execFileSync('tar', ['-a', '-c', '-f', path.join(root, '.lab-qa/source.tar.gz'), '--null', '-T', '-'], { cwd: root, input: files.join('\0') + '\0', windowsHide: true, maxBuffer: 1024 * 1024 });
console.log(`Packaged ${files.length} source files, including data/assets, scripts, lockfile and notices.`);
