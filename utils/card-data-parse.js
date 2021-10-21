/* eslint-disable */
const fs = require('fs');

function fillId(id) {
  if (id.length == 1) {
    return `00${id}`
  }
  if (id.length == 2) {
    return `0${id}`
  }
  return id;
}

const cards = [];
fs.readFile(__dirname + '/../wiki/ffxiv-9card.json', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const items = JSON.parse(data);
  items.forEach(item => {
    // id & pos
    if (item.id.length <= 3) {
      item.pos = item.id;
      item.id = fillId(item.id);
    }
    if (item.id.startsWith('编号外')) {
      item.pos = (1000 + Number.parseInt(item.id.substr(3), 10)).toString();
      item.id = `编号外${fillId(item.id.substr(3))}`;
    }
    // acq
    if (item.id.toString() == '306') {
      item.acqs = [{
        type: 'other',
        description: '摩杜纳 (X: 22.78, Y: 6.66)卡·因塔纳处用红色未知蛮神图腾×1,绿色未知蛮神图腾×1,白色未知蛮神图腾×1购买'
      }]
    } else if (item.acqs.length > 0) {
      const cacqs = item.acqs.split('\n');
      const acqs = [];
      for (let index in cacqs) {
        const cacq = cacqs[index];
        if (cacq.endsWith('对战')) {
          acqs.push({
            type: 'npc',
            description: cacq,
          })
        } else if (/九宫幻卡(\S+)包/.test(cacq)) {
          acqs.push({
            type: 'triad',
            description: cacq,
          })
        } else if (cacq.endsWith('金碟币购买')) {
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
          acqs.push({
            type: 'nige-ticket',
            description: cacq,
          })
        } else if (cacq.indexOf('双色宝石') != -1) {
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
          acqs.push({
            type: 'bzy-crystal',
            description: cacq,
          })
        } else if (cacq.indexOf('同盟徽章') != -1) {
          acqs.push({
            type: 'alliance-badge',
            description: cacq,
          })
        } else {
          acqs.push({
            type: 'battle',
            description: cacq,
          })
        }
        item.acqs = acqs;
      }
    } else {
      item.acqs = [{
        type: 'init',
        description: "初始卡组"
      }]
    }
    cards.push(item)
    fs.writeFileSync(__dirname + '/ffxiv-9card.json', JSON.stringify(cards));
  });
});

