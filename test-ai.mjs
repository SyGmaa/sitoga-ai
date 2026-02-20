import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { z } from 'zod';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function main() {
  try {
    const result = streamObject({
      model: google('gemini-2.5-pro'),
      prompt: 'Saya sakit perut dan mual, apa penyakitnya?',
      schema: z.object({
        nama_penyakit: z.string(),
        penjelasan: z.string()
      }),
    });

    for await (const chunk of result.partialObjectStream) {
      console.log('Chunk:', chunk);
    }
    
    console.log('Final:', await result.object);
  } catch (error) {
    console.error('Error:', error);
  }
}
main();
