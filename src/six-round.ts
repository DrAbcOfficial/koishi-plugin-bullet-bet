import { Context, h } from 'koishi'
import { Config } from './index'
import { shuffleArray } from './utils'
import { renderBulletImage } from './renderer'

export function registerSixRoundCommand(ctx: Context, config: Config) {
  ctx.command('轮盘赌 [bullet:number]', '塞入6发子弹')
    .alias('塞入6发子弹')
    .action(async ({ session }, bullet) => {
      if (!session.guildId) {
        return '此命令只能在群组中使用！';
      }

      let bulletCount: number;
      if (bullet !== undefined) {
        bulletCount = Math.max(0, Math.min(6, bullet));
      } else {
        bulletCount = Math.floor(Math.random() * 6) + 1;
      }

      const bullets = [1, 1, 1, 1, 1, 1];
      for (let i = 0; i < 6 - bulletCount; i++) {
        bullets[i] = 0;
      }
      const shuffledBullets = shuffleArray(bullets);

      const test = Math.floor(Math.random() * 6);
      if (shuffledBullets[test] !== 0) {
        shuffledBullets[test] = 2;
      }

      const bulletStr = '[' + shuffledBullets.join(',') + ']';
      const image = await renderBulletImage(ctx.puppeteer, bulletStr, test);

      let temp: string;
      if (bulletCount === 0) {
        temp = '😒你一发子弹也没有装填，所以你是个很怕疼的Pussy';
      } else if (bulletCount >= 6) {
        temp = '你自杀了，我不知道这有什么好隐瞒的。';
        const muteTime = bullet * config.sixRoundMuteTime;
        if (typeof session.bot.muteGuildMember === 'function') {
          await session.bot.muteGuildMember(session.guildId, session.userId, muteTime);
        } else {
          temp += '\n(但是当前平台不支持禁言功能)';
        }
      } else {
        const bantime = Math.floor(Math.random() * bulletCount) + 1;
        temp = `放入了${bulletCount}颗子弹！\n`;
        const win = shuffledBullets[test] !== 2;
        if (win) {
          temp += '😃你赢了！不需要被禁言！';
        } else {
          temp += `🔫你输了并被爆头了！禁言${bantime}分钟！`;
          if (typeof session.bot.muteGuildMember === 'function') {
            await session.bot.muteGuildMember(session.guildId, session.userId, bantime * config.sixRoundMuteTime * 1000);
          } else {
            temp += '\n(但是当前平台不支持禁言功能)';
          }
        }
      }
      session.send(temp);
      return h.image(image, 'image/png');
    });
}
