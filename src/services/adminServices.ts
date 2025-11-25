// services/adminService.ts
const API_BASE_URL = 'http://127.0.0.1:5000';

export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  edad: number;
  rol: 'Docente' | 'Estudiante' | 'Administrador';
  fecha_registro: string;
  estado: string;
}

export interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export interface ReportData {
  total_usuarios: number;
  total_cursos: number;
  total_inscripciones: number;
  cursos_populares: { titulo: string; inscritos: number }[];
  usuarios_activos: { nombre: string; cursos_completados: number }[];
  ingresos_mensuales: { mes: string; total: number }[];
}

export const adminService = {
  // Gestión completa de usuarios
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },

  async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al crear usuario');
    return response.json();
  },

  async updateUser(userId: number, userData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
    return response.json();
  },

  async deleteUser(userId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
  },

  // Gestión de permisos y roles
  async getRoles(): Promise<Role[]> {
    const response = await fetch(`${API_BASE_URL}/admin/roles`);
    if (!response.ok) throw new Error('Error al obtener roles');
    return response.json();
  },

  async createRole(roleData: { nombre: string; descripcion: string; permisos: string[] }) {
    const response = await fetch(`${API_BASE_URL}/admin/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData),
    });
    if (!response.ok) throw new Error('Error al crear rol');
    return response.json();
  },

  async updateRole(roleId: number, roleData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/roles/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roleData),
    });
    if (!response.ok) throw new Error('Error al actualizar rol');
    return response.json();
  },

  async updateUserRole(userId: number, role: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('Error al actualizar rol');
    return response.json();
  },

  // Reportes y estadísticas
  async getDashboardStats(): Promise<ReportData> {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`);
    if (!response.ok) throw new Error('Error al obtener estadísticas');
    return response.json();
  },

  async getEnrollmentReport() {
    const response = await fetch(`${API_BASE_URL}/admin/reports/enrollments`);
    if (!response.ok) throw new Error('Error al obtener reporte de inscripciones');
    return response.json();
  },

  async getCourseReport() {
    const response = await fetch(`${API_BASE_URL}/admin/reports/courses`);
    if (!response.ok) throw new Error('Error al obtener reporte de cursos');
    return response.json();
  },

  async getTeacherReport() {
    const response = await fetch(`${API_BASE_URL}/admin/reports/teachers`);
    if (!response.ok) throw new Error('Error al obtener reporte de profesores');
    return response.json();
  },

  async getStudentReport() {
    const response = await fetch(`${API_BASE_URL}/admin/reports/students`);
    if (!response.ok) throw new Error('Error al obtener reporte de estudiantes');
    return response.json();
  },

  // Generar PDFs
  async generatePDFReport(reportType: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/admin/reports/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportType, data }),
    });
    if (!response.ok) throw new Error('Error al generar PDF');
    return response.blob();
  }
};