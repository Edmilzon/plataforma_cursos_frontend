const API_BASE_URL = 'http://127.0.0.1:5000';

export const moduleService = {
    async createModule(moduleData: { nombre: string; descripcion: string; orden: number; id_curso: number; }) {
        const response = await fetch(`${API_BASE_URL}/modules`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(moduleData) });
        if (!response.ok) throw new Error('Error creando módulo');
        return response.json();
    },
    async getModulesByCourse(courseId: number) {
        const response = await fetch(`${API_BASE_URL}/modules/course/${courseId}`);
        if (!response.ok) throw new Error('Error obteniendo módulos');
        return response.json();
    }
};