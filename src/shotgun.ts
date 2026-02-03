import { Context, h } from 'koishi';
import { Config } from './index';
import { ShellType, shellInfos, renderShotgunImage } from './renderer';
import { shuffleArray } from './utils';

const storedBullets = new Map<string, ShellType[]>();
const lastCommandTime = new Map<string, number>();

export function registerShotgunCommand(ctx: Context, config: Config) {
  ctx.command('喷子赌 [bullet:number]', '子弹赌注小游戏')
    .alias('塞入霰弹')
    .action(async ({ session }, bullet) => {
      if (!session.guildId) {
        return '此命令只能在群组中使用！';
      }

      const key = config.shotGunSharedState ? session.guildId : `${session.guildId}-${session.userId}`;
      const now = Date.now();
      const lastTime = lastCommandTime.get(key) || 0;
      
      if (now - lastTime > config.shotGunCleanTime * 1000) {
        const currentBullets = storedBullets.get(key);
        if (currentBullets && currentBullets.length === 0) {
          storedBullets.delete(key);
        }
      }
      
      lastCommandTime.set(key, now);
      
      let bulletCount: number;

      if (bullet !== undefined) {
        bulletCount = Math.max(0, Math.min(config.shotGunMaxBullet, bullet));
      } else {
        bulletCount = Math.floor(Math.random() * 7) + 6;
        bulletCount = Math.max(1, Math.min(config.shotGunMaxBullet, bulletCount));
      }

      let temp: string;
      let image: Buffer | null = null;
      let pickedShell: ShellType = ShellType.SHELL_NONE;

      if (bulletCount === 0) {
        if (!storedBullets.has(key) || storedBullets.get(key)!.length === 0) {
          temp = '😒是个胆小鬼，他都不敢朝枪里放子弹';
        } else {
          temp = '已清除剩余弹药，本轮游戏结束';
          storedBullets.delete(key);
        }
      } else {
        const currentBullets = storedBullets.get(key);

        if (!currentBullets || currentBullets.length === 0) {
          const bullets: ShellType[] = [];
          for (let i = 0; i < bulletCount; i++) {
            const random = Math.random();
            let shellType: ShellType;
            
            if (random < config.shotGunRealShotChance) {
              shellType = ShellType.SHELL_REAL;
            } else if (random < config.shotGunRealShotChance + config.shotGunExplodeShotChance) {
              shellType = ShellType.SHELL_BOMB;
            } else if (random < config.shotGunRealShotChance + config.shotGunExplodeShotChance + config.shotGunMilkShotChance) {
              shellType = ShellType.SHELL_MILK;
            } else {
              shellType = ShellType.SHELL_DUMMY;
            }
            
            bullets.push(shellType);
          }

          const dummyCount = bullets.filter(b => b === ShellType.SHELL_DUMMY).length;
          if (bulletCount > 1 && dummyCount === 0) {
            const randomIndex = Math.floor(Math.random() * bullets.length);
            bullets[randomIndex] = ShellType.SHELL_REAL;
          }

          let tempMsg = '💣️共有';
          for (const si of shellInfos) {
            const count = bullets.filter(b => b === si.type).length;
            if (count > 0) {
              tempMsg += `${count}颗${si.name}, `;
            }
          }

          const insertCount = Math.max(1, Math.min(12, Math.ceil(bullets.length * 0.8)));
          tempMsg += `将随机插入${insertCount}颗弹药`;

          const bulletsToInsert = bullets.slice(0, insertCount);
          image = await renderShotgunImage(ctx.puppeteer, bulletsToInsert);
          storedBullets.set(key, shuffleArray(bulletsToInsert));
          temp = tempMsg;
        } else {
          const result = currentBullets[0];
          currentBullets.shift();

          if (currentBullets.length === 0) {
            storedBullets.delete(key);
          }

          temp = `给了自己一枪，结果是一个${shellInfos[result].resultMessage} `;
          if (currentBullets.length > 0) {
            temp += `枪内还剩下${currentBullets.length}颗子弹`;
          } else {
            temp += '枪内没有子弹了，本轮游戏结束';
          }
          pickedShell = result;
          // 仅MILK类型启动avatar元素
          const avatarUrl = result === ShellType.SHELL_MILK ? session.author.avatar : undefined;
          image = await renderShotgunImage(ctx.puppeteer, [result], avatarUrl, true);
        }
      }

      session.send(temp);

      if (image) {
        session.send(h.image(image, 'image/png'));
      }

      if (pickedShell === ShellType.SHELL_REAL) {
        if (typeof session.bot.muteGuildMember === 'function') {
          await session.bot.muteGuildMember(session.guildId, session.userId, config.shotGunMuteTime * 1000);
        }
      } else if (pickedShell === ShellType.SHELL_BOMB) {
        if (typeof session.bot.muteGuildMember === 'function') {
          await session.bot.muteGuildMember(session.guildId, session.userId, config.shotGunExplodeMuteTime * 1000);
        }
      }
    });
}
