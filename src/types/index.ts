export interface Card {
  id: string
  name: string
  // 稀有度
  rarity: string
  // 类型
  org?: string
  // 游戏版本
  patch: string
  // 卡面值
  values: string[]
  // 获取方式
  acqs?: {
    type: string,
    description: string,
    battle?: {
      name: string;
      pos: string;
      prep?: {
        conj?: string;
        type: string;
        name: string;
      }[];
    }
  }[]
  // 是否已获得
  haveIt?: boolean
  // 图标
  icon: string
  // 卡面
  surface: string,
  wiki: string,
  pos: number,
}
