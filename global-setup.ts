import * as fs from 'fs';
import * as path from 'path';
import { env } from './config/env';
import { FILES_DIR, writeFixtureFiles } from './utils/files';

// Generates upload fixtures and fails fast (with a clear message) if the environment is down.
export default async function globalSetup() {
  fs.mkdirSync(path.resolve(__dirname, '.auth'), { recursive: true });
  writeFixtureFiles();
  console.log(`[setup] upload fixtures written to ${FILES_DIR}`);
  // Soft check only: Node's fetch ignores system proxy/VPN settings that the browser uses,
  // so a failure here must NOT stop the run. The real tests will fail clearly if the site is truly down.
  try {
    const r = await fetch(`${env.baseUrl}/login`, { signal: AbortSignal.timeout(15_000) });
    console.log(`[setup] ${env.baseUrl}/login -> HTTP ${r.status}`);
  } catch (err) {
    console.warn(
      `[setup] WARNING: Node could not reach ${env.baseUrl}/login (${(err as Error).message}). ` +
        'Continuing - if the site opens in your browser this is only a proxy/Node network difference.',
    );
  }
}
