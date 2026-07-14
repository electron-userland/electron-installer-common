import path from 'node:path';
import { expect, test } from 'vitest';
import { readElectronVersion } from '../src/readelectronversion.js';

test('readElectronVersion', async () => {
  const version = await readElectronVersion(path.resolve(import.meta.dirname, 'fixtures'));
  expect(version).toBe('v3.0.11');
});
