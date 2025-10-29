'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      {/* Encabezado */}
      <section className="bg-white border-b border-gray-200 py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sobre <span className="text-blue-600">Polimathia</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Plataforma educativa desarrollada por estudiantes de la UMSS dedicada a conectar estudiantes y docentes a través de cursos de calidad, accesibles desde cualquier lugar.
          </p>
        </div>
      </section>

      {/* Sección de misión y visión */}
      <section className="py-20 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-gray-900">Nuestra misión</h2>
          <p className="text-gray-700 leading-relaxed mb-8">
            Promover la educación digital ofreciendo herramientas que faciliten el aprendizaje y la enseñanza, impulsando el crecimiento profesional y personal.
          </p>
          <h2 className="text-3xl font-semibold mb-4 text-gray-900">Nuestra visión</h2>
          <p className="text-gray-700 leading-relaxed">
            Ser una comunidad educativa reconocida por su calidad, inclusión y compromiso con el desarrollo del conocimiento.
          </p>
        </div>

        <div className="flex justify-center">
          <Image
            src="/team_illustration.svg"
            alt="Nuestro equipo"
            width={400}
            height={400}
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Valores */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Nuestros valores</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Compromiso</h3>
              <p className="text-gray-700">Nos comprometemos con el aprendizaje de cada estudiante y el crecimiento de cada docente.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Innovación</h3>
              <p className="text-gray-700">Adoptamos nuevas tecnologías y metodologías que facilitan una educación moderna y dinámica.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md">
              <h3 className="text-xl font-semibold text-blue-600 mb-2">Colaboración</h3>
              <p className="text-gray-700">Creemos en el poder del trabajo conjunto para construir una comunidad sólida y empática.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Botón de regreso */}
      <section className="py-10 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-lg font-medium"
        >
          ← Volver al inicio
        </Link>
      </section>
    </main>
  );
}
