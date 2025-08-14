import * as fs from 'fs';
import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export interface PDFProcessingResult {
  text: string;
  metadata: {
    filename: string;
    size: number;
    pageCount?: number;
    extractedAt: Date;
  };
}

export class PDFProcessor {
  async processFile(filepath: string, originalName: string): Promise<PDFProcessingResult> {
    try {
      const stats = fs.statSync(filepath);
      const pdfBuffer = fs.readFileSync(filepath);
      
      // Extract text from PDF using pdf-parse
      const pdfData = await pdfParse(pdfBuffer);
      
      return {
        text: pdfData.text,
        metadata: {
          filename: originalName,
          size: stats.size,
          pageCount: pdfData.numpages,
          extractedAt: new Date()
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  async extractTextFromBuffer(buffer: Buffer, originalName: string): Promise<PDFProcessingResult> {
    try {
      // Extract text from PDF buffer using pdf-parse
      const pdfData = await pdfParse(buffer);
      
      return {
        text: pdfData.text,
        metadata: {
          filename: originalName,
          size: buffer.length,
          pageCount: pdfData.numpages,
          extractedAt: new Date()
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
}

export const pdfProcessor = new PDFProcessor();
