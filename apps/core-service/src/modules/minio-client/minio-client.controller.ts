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
  async uploadAttachments(filesList: { files: FileDto[] }): Promise<{
    result: FileAttachmentResponse[];
  }> {
    const multerFiles: Express.Multer.File[] = filesList.files.map((file) => ({
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

    const result = await this.minioClientService.uploadAttachments({
      files: multerFiles,
    });

    // Convert AttachmentDto[] to FileAttachmentResponse[]
    const fileResponses: FileAttachmentResponse[] = result.map(
      (attachment) => ({
        url: attachment.path,
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
      }),
    );

    return { result: fileResponses };
  }
  @GrpcMethod(
    GrpcServices.MINIO_CLIENT_SERVICE,
    MinioGrpcMethods.UPLOAD_MESSAGE_ATTACHMENTS,
  )
  async uploadMessageAttachments(filesList: { files: FileDto[] }): Promise<{
    result: FileAttachmentResponse[];
  }> {
    const result = await this.minioClientService.uploadMessageAttachments({
      files: filesList.files,
    });

    // Convert AttachmentDto[] to FileAttachmentResponse[]
    const fileResponses: FileAttachmentResponse[] = result.map(
      (attachment) => ({
        url: attachment.path,
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
      }),
    );

    return { result: fileResponses };
  }
}
