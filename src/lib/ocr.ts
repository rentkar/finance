import { processDocumentWithVeryfi } from './veryfi';

export async function processFile(file: File) {
  try {
    return await processDocumentWithVeryfi(file);
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}