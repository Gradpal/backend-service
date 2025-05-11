import { CoreServiceConfigService } from '@core-service/configs/core-service-config.service';
import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { FileInfo } from './types/all.types';
import { objectExistsInJson } from '@app/common/helpers/shared.helpers';
import { AttachmentDto } from '@app/common/dtos/attachment.dto';
import { generateUUID } from '@app/common/helpers/shared.helpers';

@Injectable()
export class MinioClientService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private readonly configService: CoreServiceConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.minioEndPoint,
      port: Number(this.configService.minioPort),
      useSSL: this.configService.minioUsessl === 'true',
      accessKey: this.configService.minioAccessKey,
      secretKey: this.configService.minioSecretKey,
    });
    this.bucketName = this.configService.minioBucket;
  }
  getFileSize(file: Express.Multer.File): number {
    return file.size;
  }
  getFileName(file: Express.Multer.File): string {
    return file.originalname;
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'stretch');
    }
  }
  /**
   * Uploads a file to the MinIO bucket.
   *
   * @param {Express.Multer.File} file - The file to upload.
   * @returns {Promise<string>} The URL of the uploaded file.
   * @throws {Error} If the upload fails.
   *
   * @example
   * const fileUrl = await minioClientService.uploadFile(file);
   * console.log('Uploaded file URL:', fileUrl);
   */
  async uploadFile(file: Express.Multer.File): Promise<FileInfo> {
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
    );
    const [, url] = await Promise.all([
      this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
      ),
      this.getFilePath(fileName),
    ]);

    const fileType = this.getFileType(file);
    const orginalName = this.getFileName(file);
    const fileSize = this.getFileSize(file);
    return {
      url: url,
      type: fileType,
      size: fileSize,
      name: orginalName,
    };
  }
  getFileType(file: Express.Multer.File): string {
    return file.mimetype;
  }

  // Getting the file Url
  async getFilePath(fileName: string): Promise<string> {
    const url = await this.minioClient.presignedUrl(
      'GET',
      this.bucketName,
      fileName,
    );
    const parsedUrl = new URL(url);
    const query = parsedUrl.search;
    return parsedUrl.pathname + query;
  }
  /**
   * Downloads a file from the MinIO bucket.
   *
   * @param {string} fileName - The name of the file to download.
   * @returns {Promise<Buffer>} The file content as a Buffer.
   * @throws {Error} If the file can't be downloaded.
   *
   * @example
   * const fileContent = await minioClientService.downloadFile('example.txt');
   * console.log(fileContent.toString());
   */
  async downloadFile(fileName: string): Promise<Buffer> {
    const stream = await this.minioClient.getObject(this.bucketName, fileName);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  async getUploadedFilePath(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
    );
    return this.getFilePath(fileName);
  }

  /**
   * Copies a file within the MinIO bucket.
   *
   * @param {string} sourceFileName - The name of the source file to copy.
   * @param {string} destinationFileName - The name of the new file to create as a copy.
   * @returns {Promise<void>} Resolves when the file has been successfully copied.
   * @throws {Error} If the file can't be copied.
   *
   * @example
   * await minioClientService.copyFile('source.txt', 'destination.txt');
   * console.log('File copied successfully');
   */
  async copyFile(
    sourceFileName: string,
    destinationFileName: string,
  ): Promise<void> {
    await this.minioClient.copyObject(
      this.bucketName,
      destinationFileName,
      `${this.bucketName}/${sourceFileName}`,
    );
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }

  async getFileMetadata(fileName: string): Promise<Minio.ItemBucketMetadata> {
    return await this.minioClient.statObject(this.bucketName, fileName);
  }
  /**
   * Uploads multiple files to the MinIO bucket.
   *
   * @param {Express.Multer.File[]} files - An array of files to upload.
   * @returns {Promise<string[]>} A list of URLs for the uploaded files.
   * @throws {Error} If any file upload fails.
   *
   * @example
   * const files = [file1, file2];
   * const urls = await minioClientService.uploadMultipleFiles(files);
   * console.log('Uploaded files URLs:', urls);
   */
  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<FileInfo[]> {
    const filesInfos: FileInfo[] = [];
    for (const file of files) {
      const fileInfo = await this.uploadFile(file);
      filesInfos.push(fileInfo);
    }
    return filesInfos;
  }
  // Deleting the file from minio
  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async uploadAttachments(
    files: Express.Multer.File[],
    currentAttachments: AttachmentDto[],
  ): Promise<AttachmentDto[]> {
    const supportingDocuments = files || [];
    const filesInfo: FileInfo[] =
      await this.uploadMultipleFiles(supportingDocuments);

    const newAttachments: AttachmentDto[] = [];
    filesInfo.forEach((info: FileInfo) => {
      const attachement = new AttachmentDto(
        info.type,
        false,
        info.url,
        info.size,
        info.name,
      );
      attachement.id = generateUUID();
      const attachmentExists = objectExistsInJson<AttachmentDto>(
        currentAttachments,
        attachement,
      );
      if (!attachmentExists) {
        newAttachments.push(attachement);
      }
    });
    return newAttachments;
  }
}
