export class FileAttachmentResponse {
  url: string;
  name: string;
  size: number;
  type: string;
}

export class FileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Uint8Array;
}
