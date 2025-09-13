export class CloudflareR2Client {
  private accountId: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  private bucketName: string;
  private publicUrl: string;

  constructor(config: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl: string;
  }) {
    this.accountId = config.accountId;
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;
  }

  async uploadFile(file: File, key: string): Promise<string> {
    // Implementation simplifiée pour l'upload R2
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    const response = await fetch(`/api/cloudflare/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.url;
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}