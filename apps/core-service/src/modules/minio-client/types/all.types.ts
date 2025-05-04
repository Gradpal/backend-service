export interface MinioModuleOptions {
  endpoint: string;
  port: string;
  accessKey: string;
  secretKey: string;
  bucket?: string;
}
export interface FileInfo {
  url: string;
  type: string;
  name: string;
  size: number;
}
