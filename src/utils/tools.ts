import { MongOrb } from "./orm.js";

function levenshteinDistance(a:string, b:string) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let i = 1; i <= a.length; i++) {
      matrix[0][i] = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }
  
  export function areTextsSimilar(text1: string, text2: string) {
    const distance = levenshteinDistance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    const similarityPercentage = (1 - distance / maxLength) * 100;
  
    // Ustaw dowolny próg podobieństwa, tutaj 95%
    return similarityPercentage >= 95;
  }
 
  export const parseTextForReturn = (text:any)=>parseText(text).length>300 ? parseText(text).slice(0, 300).concat('......') : parseText(text)
  export const parseText = (text:any)=>Array.isArray(text) ? text?.map((t)=>(typeof t === 'object' ? JSON.stringify(t): t)).join(", ") : typeof text === 'object' ? JSON.stringify(text) : text

  export const cleanText = (text: any) => parseText(text).toLowerCase().replace(/object|\n/g, '').replace(/[^a-z\p{L}]/gu, '');
  export const cleanTextForGtp = (text: any) => parseText(text).toLowerCase().replace(/object|\n/g, '').replace(/[^ 0-9-a-z.+(),:;_\p{L}]/gu, '').slice(0, 200);
   

 export function findUniqueObjects(objects: {text:any}[]) {
    const uniqueObjects:any[] = [];
  
    objects.forEach(obj1 => {
      const isUnique = uniqueObjects.every(obj2 => !areTextsSimilar(cleanText(parseText(obj1.text)), cleanText(parseText(obj2.text))));
      if (isUnique) {
        uniqueObjects.push(obj1);
      }
    });
  
    return uniqueObjects;
  }

  export async function pushError(error: any){
    console.error('Error in message handler:', error);
    await MongOrb('FinderListener').collection.updateOne({chatName: "errors"},{$push:{errors: {  error }}},  { upsert: true });
  }