// ptilms-api/repositories/DepartmentRepository.js
class DepartmentRepository {
    constructor(departmentModel) {
      this.departmentModel = departmentModel;
    }
  
    async getAllDepartments() {
      return await this.departmentModel.findAll();
    }
  
    async getDepartmentById(id) {
      return await this.departmentModel.findByPk(id);
    }
  
    async createDepartment(data) {
      return await this.departmentModel.create(data);
    }
  
    async updateDepartment(id, data) {
      const department = await this.departmentModel.findByPk(id);
      if (!department) return null;
      return await department.update(data);
    }
  
    async deleteDepartment(id) {
      const department = await this.departmentModel.findByPk(id);
      if (!department) return false;
      await department.destroy();
      return true;
    }
  }
  
  export default DepartmentRepository;