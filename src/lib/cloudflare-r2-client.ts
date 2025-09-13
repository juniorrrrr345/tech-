import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

interface CloudflareR2ClientConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

export class CloudflareR2Client {
  private s3: S3Client;
  private config: CloudflareR2ClientConfig;

  constructor(config: CloudflareR2ClientConfig) {
    this.config = config;
    this.s3 = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async uploadFile(key: string, body: Buffer | string | ReadableStream | Blob | Uint8Array) {
    const command = new PutObjectCommand({
      Bucket: this.config.bucketName,
      Key: key,
      Body: body,
    });
    await this.s3.send(command);
    return `${this.config.publicUrl}/${key}`;
  }

  async listFiles(prefix?: string) {
    const command = new ListObjectsV2Command({
      Bucket: this.config.bucketName,
      Prefix: prefix,
    });
    const { Contents } = await this.s3.send(command);
    return Contents || [];
  }

  getPublicUrl(key: string): string {
    return `${this.config.publicUrl}/${key}`;
  }
}