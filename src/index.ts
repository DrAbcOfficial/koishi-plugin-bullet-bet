import { Context, Schema } from 'koishi'
import { registerSixRoundCommand } from './six-round'
import { registerShotgunCommand } from './shotgun'

export const name = 'bullet-bet'

export interface Config {
  sixRoundMuteTime: number,

  shotGunMuteTime: number,
  shotGunCleanTime: number,
  shotGunRealShotChance: number,
  shotGunExplodeShotChance: number,
  shotGunMilkShotChance: number,
  shotGunMaxBullet: number,
  shotGunExplodeMuteTime: number,
}

export const Config: Schema<Config> = Schema.object({
  sixRoundMuteTime: Schema.number().default(60).description("俄罗斯轮盘每颗子弹静音时间，单位秒"),

  shotGunMuteTime: Schema.number().default(20).description("恶魔霰弹静音时间，单位秒"),
  shotGunExplodeMuteTime: Schema.number().default(360).description("恶魔霰弹爆炸弹静音时间，单位秒"),

  shotGunCleanTime: Schema.number().default(300).description("恶魔霰弹清理时间，单位秒"),

  shotGunRealShotChance: Schema.number().default(0.2).min(0.0).max(1.0).role("slider").step(0.01).description("恶魔霰弹实弹概率"),
  shotGunExplodeShotChance: Schema.number().default(0.3).min(0.0).max(1.0).role("slider").step(0.01).description("恶魔霰弹爆炸弹概率"),
  shotGunMilkShotChance: Schema.number().default(0.5).min(0.0).max(1.0).role("slider").step(0.01).description("恶魔霰弹牛奶弹概率"),

  shotGunMaxBullet: Schema.number().default(6).max(12).min(1).role("slider").description("恶魔霰弹最大子弹数"),
});

export function apply(ctx: Context, config: Config) {
  registerSixRoundCommand(ctx, config);
  registerShotgunCommand(ctx, config);
}
