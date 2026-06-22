export interface IStorageProvider {
  uploadFile?(file: Buffer, fileName: string): Promise<string>;
  deleteFile?(fileName: string): Promise<void>;
  getFileUrl?(fileName: string): Promise<string>;
}
