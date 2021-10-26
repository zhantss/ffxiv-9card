import Dexie from 'dexie';

const app = import.meta.env.VITE_APP_NAME;
const id = import.meta.env.VITE_APP_ID;

interface Instance {
  id: string,
  cards: Array<string>
}

class UserCardDB extends Dexie {
  instance: Dexie.Table<Instance, string>;

  constructor() {
    super(app);
    this.version(1).stores({
      instance: 'id, cards',
    });
    this.instance = this.table('instance');
    this.instance.where('id').equals(id).toArray().then((items) => {
      if (items.length === 0) {
        this.instance.add({ id, cards: [] });
      }
    });
  }

  getUserCard() {
    return this.instance.get(id);
  }

  saveUserCard(cards: Set<string>) {
    return this.instance.put({ id, cards: Array.from(cards) });
  }

  cleanUserCard() {
    return this.saveUserCard(new Set());
  }
}

const db = new UserCardDB();
export default db;
