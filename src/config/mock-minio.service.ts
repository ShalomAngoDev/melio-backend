import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MockMinioService {
  private readonly logger = new Logger(MockMinioService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    objectName: string,
    filePath: string,
    metaData?: any,
  ): Promise<string> {
    try {
      const destPath = path.join(this.uploadDir, objectName);
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.copyFileSync(filePath, destPath);
      const url = this.getFileUrl(objectName);
      this.logger.log(`File uploaded successfully: ${objectName}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file ${objectName}:`, error);
      throw error;
    }
  }

  async uploadBuffer(
    objectName: string,
    buffer: Buffer,
    metaData?: any,
  ): Promise<string> {
    try {
      const destPath = path.join(this.uploadDir, objectName);
      const destDir = path.dirname(destPath);
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.writeFileSync(destPath, buffer);
      const url = this.getFileUrl(objectName);
      this.logger.log(`Buffer uploaded successfully: ${objectName}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload buffer ${objectName}:`, error);
      throw error;
    }
  }

  async getFileUrl(objectName: string, expiry: number = 7 * 24 * 60 * 60): Promise<string> {
    // Return a local file URL for development
    return `http://localhost:3000/uploads/${objectName}`;
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, objectName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`File deleted successfully: ${objectName}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${objectName}:`, error);
      throw error;
    }
  }

  async listFiles(prefix?: string): Promise<any[]> {
    try {
      const files = fs.readdirSync(this.uploadDir, { recursive: true });
      return files
        .filter(file => typeof file === 'string' && (!prefix || file.startsWith(prefix)))
        .map(file => ({
          name: file,
          size: fs.statSync(path.join(this.uploadDir, file as string)).size,
          lastModified: fs.statSync(path.join(this.uploadDir, file as string)).mtime,
        }));
    } catch (error) {
      this.logger.error('Failed to list files:', error);
      throw error;
    }
  }

  async getFile(objectName: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.uploadDir, objectName);
      return fs.readFileSync(filePath);
    } catch (error) {
      this.logger.error(`Failed to get file ${objectName}:`, error);
      throw error;
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, objectName);
      return fs.existsSync(filePath);
    } catch (error) {
      return false;
    }
  }
}
