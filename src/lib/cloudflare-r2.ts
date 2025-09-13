import { CloudflareR2Client } from './cloudflare-r2-client';

// Instance globale avec credentials hardcodés
const r2Client = new CloudflareR2Client({
  accountId: '7979421604bd07b3bd34d3ed96222512',
  accessKeyId: '82WsPNjX-j0UqZIGAny8b0uEehcHd0X3zMKNIKIN',
  secretAccessKey: '28230e200a3b71e5374e569f8a297eba9aa3fe2e1097fdf26e5d9e340ded709d',
  bucketName: 'boutique-images',
  publicUrl: 'https://pub-b38679a01a274648827751df94818418.r2.dev',
});

export default r2Client;