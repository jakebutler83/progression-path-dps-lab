import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
await mkdir(path.join(root, 'public'), { recursive: true });
await cp(path.join(root, 'cdn'), path.join(root, 'public/cdn'), { recursive: true });
await cp(path.join(root, 'LICENSE'), path.join(root, 'public/LICENSE.txt'));
await cp(path.join(root, 'FORK-NOTICE.md'), path.join(root, 'public/FORK-NOTICE.md'));
console.log('DPS Lab local images and licence notices prepared.');
