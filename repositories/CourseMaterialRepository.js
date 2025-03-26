// ptilms-api/repositories/CourseMaterialRepository.js
class CourseMaterialRepository {
    constructor(courseMaterialModel, courseModel) {
      this.courseMaterialModel = courseMaterialModel;
      this.courseModel = courseModel;
    }
  
    async getAllCourseMaterials() {
      return await this.courseMaterialModel.findAll({
        include: [
          {
            model: this.courseModel,
            as: 'Course',
          },
        ],
      });
    }
  
    async getCourseMaterialById(courseMaterialId) {
      return await this.courseMaterialModel.findByPk(courseMaterialId, {
        include: [
          {
            model: this.courseModel,
            as: 'Course',
        },
    ],
  });
}

async createCourseMaterial(data) {
  return await this.courseMaterialModel.create(data);
}

async updateCourseMaterial(courseMaterialId, data) {
  const courseMaterial = await this.courseMaterialModel.findByPk(courseMaterialId);
  if (!courseMaterial) return null;
  return await courseMaterial.update(data);
}

async deleteCourseMaterial(courseMaterialId) {
  const courseMaterial = await this.courseMaterialModel.findByPk(courseMaterialId);
  if (!courseMaterial) return false;
  await courseMaterial.destroy();
  return true;
}

async getCourseMaterialsByCourseId(courseId) {
  return await this.courseMaterialModel.findAll({
    where: { courseId: courseId },
    include: [
      {
        model: this.courseModel,
        as: 'Course',
      },
    ],
  });
}
async getCourseMaterialsByMaterialId(materialId) {
  return await this.courseMaterialModel.findAll({
    where: { materialId: materialId },
    include: [
      {
        model: this.courseModel,
        as: 'Course',
      },
    ],
  });
}
}

export default CourseMaterialRepository;