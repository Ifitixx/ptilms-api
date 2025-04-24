// ptilms-api/services/fileService.js
import s3 from '../config/aws.js';
import logger from '../utils/logger.js';

const { info, error: _error } = logger;

class FileService {
  constructor() {
    this.bucketName = 'ptilms-uploads';
}

async getFileStream(fileKey) {
  try {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey
    };
    
    const data = await s3.getObject(params).promise();
    return {
      stream: data.Body,
      contentType: data.ContentType,
      contentLength: data.ContentLength,
      metadata: data.Metadata
    };
  } catch (err) {
    _error('File retrieval error:', err);
    throw new Error('File not found');
  }
}

async deleteFile(fileKey) {
  try {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey
    };
    
    await s3.deleteObject(params).promise();
    return true;
  } catch (err) {
    _error('File deletion error:', err);
    throw new Error('Failed to delete file');
  }
}
}

export default FileService;