import { MongOrb, defineCollections } from './orm.js';
import { saveOneChat, tgConnect } from './saveChats.js';

export async function updateChats(
  mongoChats: { _id: string; username: string; collection: string; updatedAt: string }[],
) {
  try {
    const client = await tgConnect();
    if (!(await client.checkAuthorization())) return;

    const tgChats: any[] = await client.getEntity(mongoChats.map((c) => c.username || c._id));

    if (process.env.LOGS)
      console.log(
        'tgChats________',
        tgChats.map((c) => c.username || c.title),
      );
    if (!tgChats) {
      console.log(
        'tgChats NOT FIND for: ',
        mongoChats.map((c) => c.username || c._id),
      );
      return false;
    }

    let i = 0;
    for (const chat of tgChats) {
      const mongoChat = mongoChats.find((ch) => ch.username === chat.username);
      const startDate = Math.round(new Date(mongoChat?.updatedAt || '2023-12-30T21:13').getTime() / 1000);
      i += 1;
      if (process.env.LOGS) console.log('!!!!!!!!!!!chat:', chat.title, chat.username, '=', mongoChat?.username);
      if (process.env.LOGS)
        console.log('!!!!!!!!!!!data for update:', new Date(mongoChat?.updatedAt || '2023-12-30T12:12'));
      const collection = mongoChat?.collection;
      if (process.env.LOGS) console.log('>>>> collection_____', collection);
      if (!collection) return false;
      const update = await saveOneChat(client, collection, chat, startDate);
      if (update) console.log(`Chat ${chat.username} successfully saved!!!`);
    }
    return true;
  } catch (e) {
    console.log(e);
  }
}

export async function findAndUpdateChats(
  chatsReg: string[],
  sities?: string[],
): Promise<{ chats?: string[] | undefined; collections?: string[] | undefined } | undefined> {
  try {
    if (chatsReg.length === 1 && chatsReg[0] === '*') return sities ? { collections: sities } : {};
    let chats: any[] = [];

    const chatNameRegexPatterns = (chatsReg.length > 0 ? chatsReg : [''])?.map((name) => new RegExp(name, 'i'));
    if (process.env.LOGS) console.log('sities from input______________________:', sities);
    if (process.env.LOGS) console.log('all collections______________________:', await defineCollections());

    const collections = sities || (await defineCollections());
    if (!collections) return { chats: [], collections: [] };

    for (const collection of collections) {
      const aggregationPipeline = [
        {
          $match: {
            $or: [
              {
                name: {
                  $in: chatNameRegexPatterns,
                },
              },
              {
                username: {
                  $in: chatNameRegexPatterns,
                },
              },
            ],
          },
        },
        {
          $project: {
            updatedAt: 1,
            date: 1,
            username: 1,
            class_name: 1,
            name: 1,
            _id: 1,
            isPartner: 1,
          },
        },
      ];

      const result: any[] = await MongOrb(collection)?.aggregate(aggregationPipeline).toArray();
      chats = chats.concat(
        result.map((chat) => ({
          ...chat,
          collection: collection,
          updatedAt: chat.updatedAt || new Date().toISOString(),
        })),
      );
    }
    //console.log(chats);
    if (chats.length > 0) updateChats(chats.filter((ch) => !ch.isPartner));
    return { chats: chats.map((ch) => ch.name || ch.username), collections };
  } catch (e) {
    console.log(e);
  }
}
