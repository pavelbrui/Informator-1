

import { FieldResolveInput } from 'stucco-js';
import { resolverFor } from '../zeus/index.js';

import { MongOrb, getEnv } from '../utils/orm.js';

import { MongoClient} from 'mongodb';





const client = new MongoClient(getEnv('MONGO_URL'));

try {
  await client.connect();

  const collections = await client.db('son_dev').listCollections().toArray();

  for (const collection of collections) {
    const collectionName = collection.name; // Nazwa aktualnej kolekcji
    const db = client.db('son_dev');
    const coll = db.collection(collectionName);

    // Twój warunek, np. wyszukaj dokumenty, które zawierają dane z args
    const query = {
      // Dodaj tutaj warunek, np. pole "topic" równa się args.topic
      // Możesz dostosować to do swoich potrzeb
    };

    // Aktualizuj dokumenty, np. ustaw pole "checked" na true
    const update = {
      $set: {
        checked: true // Możesz dostosować to do swoich potrzeb
      }
    };

    const result = await coll.updateMany(query, update);
    console.log(`Zaktualizowano ${result.modifiedCount} dokumentów w kolekcji ${collectionName}`);
  }
} catch (error) {
  console.error('Wystąpił błąd:', error);
} finally {
  await client.close();
}
