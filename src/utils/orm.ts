import { iGraphQL } from 'i-graphql';
import { Db, MongoClient, ObjectId } from 'mongodb';
import { cleanText, pushError } from './tools.js';
const orm = async () => {
  return iGraphQL<Record<string, any>, { _id: () => string; createdAt: () => string }>({
    _id: () => new ObjectId().toHexString(),
    createdAt: () => new Date().toISOString(),
  });
};

export const MongOrb = await orm();

export const getEnv = (envName: string) => {
  const envValue = process.env[envName];
  if (typeof envValue === 'undefined') {
    throw new Error(`Please define ${envName}`);
  }
  return envValue;
};

export async function defineCollections(collectionFilters?: string[] | null) {
  const client = new MongoClient(getEnv('MONGO_URL'));
  const allCollections = await client.db(getEnv('BASE_NAME')).listCollections().toArray();
  let collections = allCollections.map((c) => c.name);

  if (collectionFilters?.length && collectionFilters[0] && collectionFilters[0].length > 0) {
    collections = collections.filter((col) => {
      const cleanedName = cleanText(col);
      return collectionFilters?.some((keyword) => cleanText(keyword) && cleanedName.includes(cleanText(keyword)));
    });
  }
  return collections;
}

export async function findCollectionWithObjectName(name: string) {
  try {
    const collections = await defineCollections();
    for (const collection of collections) {
      console.log(collection);

      const foundElement = await MongOrb(collection).collection.findOne({ name: name });
      if (foundElement) {
        return collection;
      }
    }
    return null;
  } catch (error) {
    pushError(`Błąd podczas wyszukiwania kolekcji dla name: ${name}. Error:` + JSON.stringify(error));
    throw error;
  }
}
