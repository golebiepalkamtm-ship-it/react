import { S3Client } from '@aws-sdk/client-s3';
import { validatedEnv } from './env.js';

const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'eu-west-1',
  endpoint: 'https://nctvwxiqzbedgcmetyal.storage.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: validatedEnv.SUPABASE_SECRET_ACCESS_KEY,
    secretAccessKey: validatedEnv.SUPABASE_SECRET_SECRET_KEY,
  }
});

export default s3Client;
