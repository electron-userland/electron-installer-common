import path from 'node:path';
import { expect, test } from 'vitest';
import { readMetadata } from '../src/readmetadata.js';

const fixturesDir = path.join(import.meta.dirname, 'fixtures');

test('readMetadata for app with asar', async () => {
  const packageJSON = await readMetadata({
    src: path.join(fixturesDir, 'app-with-asar'),
    logger: (log) => log,
  });
  expect(packageJSON.description).toMatch(/with asar/);
});

test('readMetadata for app without asar', async () => {
  const packageJSON = await readMetadata({
    src: path.join(fixturesDir, 'app-without-asar'),
    logger: (log) => log,
  });
  expect(packageJSON.description).toMatch(/without asar/);
});

test('readMetadata for macOS app with asar', async () => {
  const packageJSON = await readMetadata({
    src: path.join(fixturesDir, 'macOS-app-with-asar'),
    logger: (log) => log,
  });
  expect(packageJSON.description).toMatch(/with asar/);
});

test('readMetadata for macOS app without asar', async () => {
  const packageJSON = await readMetadata({
    src: path.join(fixturesDir, 'macOS-app-without-asar'),
    logger: (log) => log,
  });
  expect(packageJSON.description).toMatch(/without asar/);
});

test('readMetadata for app without a resources directory', async () => {
  await expect(readMetadata({ src: fixturesDir, logger: (log) => log })).rejects.toThrow(
    /Could not determine resources directory/,
  );
});

test('readMetadata for app with a bad package.json', async () => {
  await expect(
    readMetadata({
      src: path.join(fixturesDir, 'app-with-bad-package-json'),
      logger: (log) => log,
    }),
  ).rejects.toThrow(/Could not find, read, or parse/);
});
