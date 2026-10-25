import * as fs from 'fs';
import * as path from 'path';
import { env } from '../config/env';

export const FILES_DIR = path.resolve(__dirname, '..', 'fixtures-files');
export const file = (name: string) => path.join(FILES_DIR, name);

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);
const JPG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64',
);
const PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n' +
    'trailer<</Root 1 0 R>>\n%%EOF\n',
);
const EXE = Buffer.concat([Buffer.from('MZ'), Buffer.alloc(256, 0x90)]);

/** Creates every upload fixture used by the document tests (idempotent). */
export function writeFixtureFiles() {
  fs.mkdirSync(FILES_DIR, { recursive: true });
  const w = (n: string, b: Buffer) => fs.writeFileSync(file(n), b);
  w('valid.pdf', PDF);
  w('valid.jpg', JPG);
  w('valid.png', PNG);
  w('bad.exe', EXE);
  w('bad.zip', Buffer.from('PK\x03\x04' + 'x'.repeat(64), 'binary'));
  w('bad.js', Buffer.from('alert(1)'));
  w('bad.html', Buffer.from('<html><script>alert(1)</script></html>'));
  w('empty.pdf', Buffer.alloc(0));
  w('corrupt.png', Buffer.from('this is not a png'));
  w('invoice.pdf.exe', EXE);
  w('disguised.pdf', EXE); // executable content, pdf extension
  w('name with spaces & symbols (1).pdf', PDF);
  if (env.maxUploadMb) {
    const limit = env.maxUploadMb * 1024 * 1024;
    w('at-limit.pdf', Buffer.concat([PDF, Buffer.alloc(limit - PDF.length, 0x20)]));
    w('over-limit.pdf', Buffer.concat([PDF, Buffer.alloc(limit + 1 - PDF.length, 0x20)]));
  }
}
