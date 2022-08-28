/* eslint-disable */
const fs = require('fs');
const { pinyin } = require('pinyin-pro');
const cardNpc = require('../wiki/ffxiv-9card-wiki-npc.json');
const npcAppend = require('../wiki/ffxiv-9card-npc-append.json');
const npcInfo = {};

Object.keys(cardNpc).forEach(name => {
  if (npcAppend[name]) {
    npcInfo[name] = Object.assign({}, cardNpc[name], npcAppend[name])
  }
})

const avators = fs.readdirSync(__dirname + "/../public/ffxiv/npc")

function fillId(id) {
  if (id.length == 1) {
    return `00${id}`
  }
  if (id.length == 2) {
    return `0${id}`
  }
  return id;
}

function createTags(items) {
  const tags = [];
  items.forEach(item => {
    tags.push(item);
    // 拼音
    tags.push(pinyin(item, { toneType: 'none', type: 'array' }).join(''));
    // 首字母
    tags.push(pinyin(item, { pattern: 'initial', type: 'array' }).join(''));
  })
  return tags;
}

function pushTag(tags, tag) {
  return tags.concat(createTags(tag));
}


const cards = [];
const cardRecord = {};
const cardTags = {};
fs.readFile(__dirname + '/../wiki/ffxiv-9card.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const items = JSON.parse(data);
  const npc = {};
  const traid = {};
  const battle = {};
  const token = {
    '金碟币': {
      cards: new Set()
    },
    '天穹街振兴票': {
      cards: new Set()
    },
    '双色宝石': {
      cards: new Set()
    },
    '博兹雅晶簇': {
      cards: new Set()
    },
    '同盟徽章': {
      cards: new Set()
    },
  };
  const org = {};
  items.forEach(item => {
    // origin id
    const origin_id = item.id;
    // id & pos
    if (item.id.length <= 3) {
      item.pos = Number.parseInt(item.id);
      item.id = fillId(item.id);
    }
    if (item.id.startsWith('编号外')) {
      item.pos = (1000 + Number.parseInt(item.id.substr(3), 10));
      item.id = `编号外${fillId(item.id.substr(3))}`;
    }
    const curTags = new Set();
    // search tag id
    if (cardTags[item.id] == null) {
      cardTags[item.id] = [item.id.startsWith('编号外') ? item.id.substr(3) : item.id];
      curTags.add(item.name);
    }
    // acq
    if (item.id.toString() == '306') {
      item.acqs = [{
        type: 'other',
        description: '摩杜纳 (X: 22.78, Y: 6.66)卡·因塔纳处用红色未知蛮神图腾×1,绿色未知蛮神图腾×1,白色未知蛮神图腾×1购买'
      }]
      curTags.add('摩杜纳');
    } else if (item.acqs.length > 0) {
      const cacqs = item.acqs.split('\n');
      const acqs = [];
      for (let index in cacqs) {
        const cacq = cacqs[index];
        if (cacq.endsWith('对战')) {
          // NPC 信息
          const matchs = cacq.match(/与(\S+)(.+?)的(\S+)进行幻卡对战/);
          let battle = null;
          if (matchs.length == 4) {
            let npc_name = matchs[3];
            const map = matchs[1];
            const pos = matchs[2];
            if (npc[npc_name] == null) {
              if (npc_name == '莫莫蒂') {
                npc_name = '莫莫蒂·莫蒂';
              }
              npc[npc_name] = {
                desc: `${map}${pos}`,
                tags: createTags([npc_name, map]),
                cards: new Set(),
              };
              if (npcInfo[npc_name]) {
                const cur_npc = npcInfo[npc_name];
                const avator = avators.indexOf(cur_npc.avator) != -1 ? cur_npc.avator : null;
                const rules = cur_npc.rules;
                const notAchiev = cur_npc["not-achiev"]
                // const level = cur_npc.rules.length >= 2 ? cur_npc.rules[1] : null;
                npc[npc_name].details = {
                  pos: cur_npc.pos,
                  prep: cur_npc.prep
                }
                if (avator) npc[npc_name].details.avator = avator;
                if (rules) npc[npc_name].details.rules = rules;
                // if (level) npc[npc_name].details.level = level;
                if (notAchiev) npc[npc_name].details.notAchiev = true;
              }
            }
            // NPC 卡片列表
            npc[npc_name].cards.add(item.id);
            curTags.add(npc_name);
            curTags.add(map);
            battle = {
              pos: npc[npc_name].details.pos,
              name: npc_name,
              prep: npc[npc_name].details.prep
            }
          }
          if (battle != null) {
            acqs.push({
              type: 'npc',
              description: cacq,
              battle: battle
            })
          } else {
            acqs.push({
              type: 'npc',
              description: cacq,
            })
          }
        } else if (/(\S*)九宫幻卡(\S*)包/.test(cacq)) {
          // 金蝶卡包
          const triad_name = cacq;
          if (traid[triad_name] == null) {
            traid[triad_name] = {
              cards: [],
            }
          }
          traid[triad_name].cards.push(item.id);
          acqs.push({
            type: 'triad',
            description: cacq,
          })
        } else if (cacq.endsWith('金碟币购买')) {
          // 金碟币
          token['金碟币'].cards.add(item.id);
          acqs.push({
            type: 'mgp',
            description: cacq,
          })
        } else if (cacq.endsWith('宝藏') && cacq.startsWith('鉴定物品')) {
          acqs.push({
            type: 'treasure',
            description: cacq
          })
        } else if (cacq.indexOf('临危受命') != -1) {
          acqs.push({
            type: 'fate',
            description: cacq
          })
        } else if (cacq.indexOf('天穹街振兴票') != -1) {
          // 尼哥票
          token['天穹街振兴票'].cards.add(item.id);
          acqs.push({
            type: 'nige-ticket',
            description: cacq,
          })
        } else if (cacq.indexOf('双色宝石') != -1) {
          // 双色
          token['双色宝石'].cards.add(item.id);
          acqs.push({
            type: 'bi-gem',
            description: cacq,
          })
        } else if (cacq.startsWith('达成成就')) {
          acqs.push({
            type: 'achievement',
            description: cacq,
          })
        } else if (cacq.indexOf('九宫幻卡大赛') != -1) {
          acqs.push({
            type: '9card-competition',
            description: cacq,
          })
        } else if (cacq.indexOf('博兹雅晶簇') != -1) {
          // 晶簇
          token['博兹雅晶簇'].cards.add(item.id);
          acqs.push({
            type: 'bzy-crystal',
            description: cacq,
          })
        } else if (cacq.indexOf('同盟徽章') != -1) {
          // 狩猎币
          token['同盟徽章'].cards.add(item.id);
          acqs.push({
            type: 'alliance-badge',
            description: cacq,
          })
        } else if (cacq.indexOf('幸福兔') != -1) {
          acqs.push({
            type: 'other',
            description: cacq
          })
        } else {
          if (battle[cacq] == null) {
            battle[cacq] = {
              tags: createTags([cacq]),
              cards: new Set(),
            }
          }
          battle[cacq].cards.add(item.id);
          acqs.push({
            type: 'battle',
            description: cacq,
          })
          curTags.add(cacq);
        }
        item.acqs = acqs;
      }
    } else {
      if (!origin_id.startsWith("编号外") && origin_id <= 20) {
        item.acqs = [{
          type: 'init',
          description: "初始卡组"
        }]
      } else {
        item.acqs = [{
          type: "unknow",
          description: ""
        }]
      }
    }
    item.values = item.values.map(value => Number.parseInt(value, 10) > 9 ? 'A' : value);
    delete item['haveIt'];
    if (item.org != 'none') {
      if (org[item.org] == null) {
        org[item.org] = {
          cards: []
        }
      }
      org[item.org].cards.push(item.id);
    }
    cards.push(item);
    cardRecord[item.id] = item;
    cardTags[item.id] = [...new Set(pushTag(cardTags[item.id], Array.from(curTags)))]
  });

  const sorts = {
    npc: Object.keys(npc).sort((a, b) => {
      const tagA = npc[a].tags[2];
      const tagB = npc[b].tags[2];
      return tagA === [tagA, tagB].sort()[0] ? -1 : 1;
    })
  }
  const ext = {
    menu: {
      all: '幻卡',
      npc: 'NPC',
      traid: '卡包',
      battle: '副本',
      token: '代币',
      org: '类型',
    },
    sorts,
    content: {
      all: { '幻卡': { cards: ["*"]} },
      npc, traid, battle, token, org
    }
  };

  const record = cardRecord;
  const cardKeys = Object.keys(record).sort((a, b) => record[a].pos - record[b].pos);

  fs.writeFileSync(__dirname + '/ffxiv-9card.json', JSON.stringify(cards));
  fs.writeFileSync(__dirname + '/ffxiv-9card-record.json', JSON.stringify(cardRecord));
  fs.writeFileSync(__dirname + '/ffxiv-9card-card-keys.json', JSON.stringify(cardKeys));
  fs.writeFileSync(__dirname + '/ffxiv-9card-ext.json', JSON.stringify(ext, (key, value) => value instanceof Set ? [...value]: value));
  fs.writeFileSync(__dirname + '/ffxiv-9card-tags.json', JSON.stringify(Object.keys(cardTags).map((id) => {
    return {
      id,
      tags: cardTags[id],
    }
  })));
});

