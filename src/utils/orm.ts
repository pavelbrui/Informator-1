import { iGraphQL } from 'i-graphql';
import { MongoClient, ObjectId } from 'mongodb';
import { cleanText } from './tools.js';
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





export async function defineCollections (collectionFilters?:string[] | null) {
  const client = new MongoClient(getEnv('MONGO_URL'));
  const allCollections = await client.db(getEnv('BASE_NAME')).listCollections().toArray();
  let collections = allCollections.map((c)=>c.name)

if(collectionFilters?.length && collectionFilters[0]&&collectionFilters[0].length>0) {
  collections = collections.filter((col) => {
      const cleanedName = cleanText(col);
      return collectionFilters?.some(keyword => cleanText(keyword) && cleanedName.includes(cleanText(keyword)));
      });
   }
console.log("_______________")
console.log(collections)
return collections
  }