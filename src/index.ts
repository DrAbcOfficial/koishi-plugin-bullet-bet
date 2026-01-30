import { Context, Schema } from 'koishi'

export const name = 'bullet-bet'

export interface Config {
  sixRoundMuteTime: number,
  sixRoundCleanTime: number,

  shotGunMuteTime: number,
  shotGunCleanTime: number,
  shotGunRealShotChance: number,
  shotGunExplodeShotChance: number,
  shotGunMilkShotChance: number,
  shotGunMaxBullet: number,
}

export const Config: Schema<Config> =  Schema.object({
    sixRoundCleanTime: Schema.number().default(300).description("俄罗斯轮盘清理时间，单位秒"),
    sixRoundMuteTime: Schema.number().default(60).description("俄罗斯轮盘每颗子弹静音时间，单位秒"),

    shotGunMuteTime: Schema.number().default(20).description("恶魔霰弹静音时间，单位秒"),
    shotGunCleanTime: Schema.number().default(300).description("恶魔霰弹清理时间，单位秒"),
    shotGunRealShotChance: Schema.number().default(0.2).description("恶魔霰弹实弹概率"),
    shotGunExplodeShotChance: Schema.number().default(0.3).description("恶魔霰弹爆炸弹概率"),
    shotGunMilkShotChance: Schema.number().default(0.5).description("恶魔霰弹牛奶弹概率"),
    shotGunMaxBullet: Schema.number().default(6).description("恶魔霰弹最大子弹数"),
});

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function apply(ctx: Context, config: Config) {
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
          await session.bot.muteGuildMember(session.guildId, session.userId, bantime * config.sixRoundMuteTime);
        } else {
          temp += '\n(但是当前平台不支持禁言功能)';
        }
      }
    }
    return temp;
  });


  ctx.command('喷子赌 <bullet:number>', '子弹赌注小游戏')
  .action(async ({ session }, bullet) => {
    session.text('子弹赌注小游戏，敬请期待！')
  });
}
