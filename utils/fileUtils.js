// ptilms-api/utils/fileUtils.js
import { models } from '../models/index.js'; // Import the models object

const { CourseMaterial, Submission } = models; // Extract models from the object

export const getOriginalFilename = async (fileKey) => {
  try {
    // Check CourseMaterial model
    const material = await CourseMaterial.findOne({
      where: { fileKey: fileKey }, // Changed to fileKey
      attributes: ['originalName'], // Only retrieve originalName
    });
    if (material) return material.originalName;

    // Check Submission model
    const submission = await Submission.findOne({
      where: { fileKey: fileKey },
      attributes: ['originalFilename'], // Changed to originalFilename
    });
    if (submission) return submission.originalFilename;

    return null; // Not found
  } catch (error) {
    console.error("Error retrieving original filename:", error);
    return null;
  }
};