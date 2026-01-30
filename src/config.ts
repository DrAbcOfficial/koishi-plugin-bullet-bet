import { Schema } from 'koishi'

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

export const Config: Schema<Config> = Schema.object({
  sixRoundClean: Schema.number().default(300).description("俄罗斯轮盘清理时间，单位秒"),
  sixRoundMuteTime: Schema.number().default(60).description("俄罗斯轮盘每颗子弹静音时间，单位秒"),

  shotGunMuteTime: Schema.number().default(20).description("恶魔霰弹静音时间，单位秒"),
  shotGunCleanTime: Schema.number().default(300).description("恶魔霰弹清理时间，单位秒"),
  shotGunRealShotChance: Schema.number().default(0.2).description("恶魔霰弹实弹概率"),
  shotGunExplodeShotChance: Schema.number().default(0.3).description("恶魔霰弹爆炸弹概率"),
  shotGunMilkShotChance: Schema.number().default(0.5).description("恶魔霰弹牛奶弹概率"),
  shotGunMaxBullet: Schema.number().default(6).description("恶魔霰弹最大子弹数"),
});
