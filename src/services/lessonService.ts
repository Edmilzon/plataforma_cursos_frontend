const API_BASE_URL = 'http://127.0.0.1:5000';

export const lessonService = {
    async createLesson(lessonData: { titulo: string; contenido: string; url_recurso: string; orden: number; id_modulo: number; }) {
        const response = await fetch(`${API_BASE_URL}/lessons`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lessonData) });
        if (!response.ok) throw new Error('Error creando lección');
        return response.json();
    },
    async getLessonsByModule(moduleId: number) {
        const response = await fetch(`${API_BASE_URL}/lessons/module/${moduleId}`);
        if (!response.ok) throw new Error('Error obteniendo lecciones');
        return response.json();
    }
};