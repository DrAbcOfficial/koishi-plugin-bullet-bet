import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import Puppeteer from 'koishi-plugin-puppeteer'

export async function renderBulletImage(puppeteer: Puppeteer, bulletStr: string, chose: number): Promise<Buffer> {
  const htmlPath = join(__dirname, '..', 'html', 'bet.html');
  let htmlContent = readFileSync(htmlPath, 'utf-8');

  htmlContent = htmlContent.replace('{{BULLET}}', bulletStr);
  htmlContent = htmlContent.replace('{{CHOSE}}', chose.toString());

  const tempHtmlPath = join(__dirname, '..', 'html', 'temp_render.html');
  writeFileSync(tempHtmlPath, htmlContent);

  const tempFileUrl = 'file://' + tempHtmlPath.replace(/\\/g, '/');
  const page = await  puppeteer.browser.newPage();
  const viewport = page.viewport();
  viewport.width = 320;
  viewport.height = 320;
  await page.goto(tempFileUrl);
  await page.waitForNetworkIdle();
  const screenshot = await page.screenshot({ type: 'png' });
  await puppeteer.browser.close();

  unlinkSync(tempHtmlPath);

  return screenshot;
}

export enum ShellType {
  SHELL_NONE = 0,
  SHELL_REAL = 1,
  SHELL_DUMMY = 2,
  SHELL_BOMB = 3,
  SHELL_MILK = 4
}

export interface ShellInfo {
  name: string;
  resultMessage: string;
  type: ShellType;
}

export const shellInfos: ShellInfo[] = [
  { name: '', resultMessage: '', type: ShellType.SHELL_NONE },
  { name: '实弹', resultMessage: '实弹', type: ShellType.SHELL_REAL },
  { name: '假弹', resultMessage: '假弹', type: ShellType.SHELL_DUMMY },
  { name: '爆炸弹', resultMessage: '爆炸弹，受到了额外伤害！', type: ShellType.SHELL_BOMB },
  { name: '牛奶弹', resultMessage: '牛奶弹，被喷了一脸！', type: ShellType.SHELL_MILK }
];

export async function renderShotgunImage(puppeteer: Puppeteer, shells: ShellType[], avatarUrl?: string, useShotTemplate: boolean = false): Promise<Buffer> {
  const htmlFileName = useShotTemplate ? 'shotgun_shot.html' : 'shotgun.html';
  const htmlPath = join(__dirname, '..', 'html', htmlFileName);
  let htmlContent = readFileSync(htmlPath, 'utf-8');

  const shellArray = '[' + shells.map(s => s).join(',') + ']';
  htmlContent = htmlContent.replace('{{SHELL}}', shellArray);
  htmlContent = htmlContent.replace('{{AVATAR}}', avatarUrl || '');
  htmlContent = htmlContent.replace('{{AVATAR_VISIBILITY}}', avatarUrl ? 'visible' : 'hidden');

  if (useShotTemplate && shells.length > 0) {
    htmlContent = htmlContent.replace('{{SHOT_TYPE}}', shells[0].toString());
  }

  const tempHtmlPath = join(__dirname, '..', 'html', 'temp_shotgun.html');
  writeFileSync(tempHtmlPath, htmlContent);

  const tempFileUrl = 'file://' + tempHtmlPath.replace(/\\/g, '/');

  const page = await  puppeteer.browser.newPage();
  const viewport = page.viewport();
  viewport.width = 640;
  viewport.height = 300;
  await page.goto(tempFileUrl);
  await page.waitForNetworkIdle();

  const screenshot = await page.screenshot({ type: 'png' });
  await puppeteer.browser.close();

  unlinkSync(tempHtmlPath);

  return screenshot;
}
