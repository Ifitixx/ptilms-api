// ptilms-api/config/aws.js
import AWS from 'aws-sdk';
    
const minioEndpoint = new AWS.Endpoint(process.env.MINIO_ENDPOINT);

AWS.config.update({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  endpoint: minioEndpoint,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const s3 = new AWS.S3();

export default s3;