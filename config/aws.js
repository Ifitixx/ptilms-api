// ptilms-api/config/aws.js
import AWS from 'aws-sdk';
import config from './config.cjs';

// Configure AWS SDK for MinIO
const minioConfig = {
  accessKeyId: config.minio.accessKey,
  secretAccessKey: config.minio.secretKey,
  endpoint: config.minio.endpoint,
  s3ForcePathStyle: true, // Required for MinIO
  signatureVersion: 'v4',
  region: 'us-east-1', // MinIO requires a region to be specified
  sslEnabled: config.minio.endpoint.startsWith('https://'),
};

AWS.config.update(minioConfig);

const s3 = new AWS.S3({
  params: { Bucket: config.minio.bucketName },
  signatureVersion: 'v4',
});

export default s3;