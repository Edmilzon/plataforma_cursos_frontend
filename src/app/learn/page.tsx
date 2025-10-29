export default function LearnPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Aprende con Polimathia</h1>
        <p className="text-gray-700 leading-relaxed mb-8">
          Explora una amplia variedad de cursos diseñados para potenciar tus habilidades. 
          Nuestra plataforma te permite aprender a tu propio ritmo, con el apoyo de docentes especializados 
          y materiales actualizados constantemente.
        </p>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Cursos básicos</h2>
            <p className="text-gray-600">Comienza desde cero y domina los fundamentos con guías simples y prácticas.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <h2 className="text-xl font-semibold text-green-700 mb-2">Cursos intermedios</h2>
            <p className="text-gray-600">Desarrolla tu conocimiento con proyectos más desafiantes y tutores especializados.</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">Cursos avanzados</h2>
            <p className="text-gray-600">Perfecciona tus competencias y obtén certificaciones reconocidas.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
