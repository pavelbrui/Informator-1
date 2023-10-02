import { iGraphQL } from 'i-graphql';
import { ObjectId } from 'mongodb';
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