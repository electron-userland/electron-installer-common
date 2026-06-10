import debugModule from 'debug';
import ejs from 'ejs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const debug = debugModule('electron-installer-common:template');

/**
 * Renders an EJS template string. Unlike stock EJS, `<%= %>` interpolations are not HTML-escaped,
 * for compatibility with the `lodash.template`-based implementation this module historically used.
 */
export function renderTemplate(template: string, data: Record<string, unknown>): string {
  return ejs.render(template, data, {
    escape: (value: unknown) => (value === null || value === undefined ? '' : String(value)),
  });
}

/**
 * Fill in a template with the hash of data.
 */
export async function generateTemplate(
  templatePath: string,
  data: Record<string, unknown>,
): Promise<string> {
  debug(`Generating template from ${templatePath}`);

  const result = renderTemplate(await readFile(templatePath, 'utf8'), data);
  debug(`Generated template from ${templatePath}\n${result}`);
  return result;
}

/**
 * Create a file from a template. Any necessary directories are automatically created.
 */
export async function createTemplatedFile(
  templatePath: string,
  dest: string,
  options: Record<string, unknown>,
  filePermissions?: number,
): Promise<void> {
  await mkdir(path.dirname(dest), { recursive: true, mode: 0o755 });
  const data = await generateTemplate(templatePath, options);
  await writeFile(dest, data, filePermissions ? { mode: filePermissions } : {});
}
