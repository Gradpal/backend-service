import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { MinioClientService } from './minio-client.service';
import {
  GrpcServices,
  MinioGrpcMethods,
} from '@core-service/common/constants/grpc.constants';
import { FileAttachmentResponse, FileDto } from './dtos/grpc.dto';
import { Express } from 'express';

@Controller()
export class MinioClientController {
  constructor(private readonly minioClientService: MinioClientService) {}
  @GrpcMethod(GrpcServices.MINIO_CLIENT_SERVICE, MinioGrpcMethods.UPLOAD_FILE)
  async uploadFile(file: FileDto): Promise<FileAttachmentResponse> {
    const multerFile: Express.Multer.File = {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: Buffer.from(file.buffer),
      destination: '',
      filename: file.originalname,
      path: '',
      stream: null as any,
    };
    const result = await this.minioClientService.uploadFile(multerFile);
    return result;
  }
  @GrpcMethod(
    GrpcServices.MINIO_CLIENT_SERVICE,
    MinioGrpcMethods.UPLOAD_ATTACHMENTS,
  )
  async uploadAttachments(files: FileDto[]): Promise<{
    result: FileAttachmentResponse[];
  }> {
    const multerFiles: Express.Multer.File[] = files.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      size: file.size,
      buffer: Buffer.from(file.buffer),
      destination: '',
      filename: file.originalname,
      path: '',
      stream: null as any,
    }));

    const result =
      await this.minioClientService.uploadMultipleFiles(multerFiles);
    return {
      result: result,
    };
  }
}
