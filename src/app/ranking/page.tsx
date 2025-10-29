'use client';

import { useState, useEffect, useMemo } from 'react';
import { BottomNavbar } from '@/components/BottomNavbar';
import {
  rankingService,
  StudentRank,
  CourseRatingRank,
  CoursePopularityRank,
} from '@/services/rankingService';

type RankingType = 'students' | 'course_rating' | 'course_popularity';

// --- Íconos SVG para una UI más rica ---
const MedalIcon = ({ rank }: { rank: number }) => {
  const colors = {
    1: 'text-yellow-400',
    2: 'text-gray-400',
    3: 'text-yellow-600',
  };
  if (rank > 3) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-6 h-6 ${colors[rank] || 'text-gray-300'}`}
    >
      <path d="M12 6.52c.44-.49.99-.82 1.6-.98a3.48 3.48 0 0 1 3.38.44c.9.73 1.38 1.83 1.02 2.95-.36 1.12-1.38 1.9-2.64 2.08a4.5 4.5 0 0 1-1.36.11" />
      <path d="M12 6.52c-.44-.49-.99-.82-1.6-.98a3.48 3.48 0 0 0-3.38.44c-.9.73-1.38 1.83-1.02 2.95.36 1.12 1.38 1.9 2.64 2.08a4.5 4.5 0 0 0 1.36.11" />
      <path d="M12 6.52V11.8l-2.12 4.24a1.06 1.06 0 0 0 .9 1.66c.58 0 1.06-.47 1.06-1.06v-1.12" />
      <path d="M12 11.8l2.12 4.24a1.06 1.06 0 0 1-.9 1.66c-.58 0-1.06-.47-1.06-1.06v-1.12" />
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3-3-3" />
      <path d="M12 22a7 7 0 0 1-7-7c0-2 1-3 3-3" />
    </svg>
  );
};

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

const PointsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500"><path d="m12 14 4-4"></path><path d="M12 14 8 10"></path><path d="M12 22a4.8 4.8 0 0 0 4-2 4.8 4.8 0 0 0 0-6 4.8 4.8 0 0 0-8 0 4.8 4.8 0 0 0 0 6 4.8 4.8 0 0 0 4 2Z"></path><path d="M12 2a4.8 4.8 0 0 1 4 2 4.8 4.8 0 0 1 0 6 4.8 4.8 0 0 1-8 0 4.8 4.8 0 0 1 0-6 4.8 4.8 0 0 1 4-2Z"></path></svg>
);

// --- Componente para la lista de Estudiantes ---
const StudentRankingList = ({ students }: { students: StudentRank[] }) => (
  <div className="space-y-3">
    {students.map((student, index) => (
      <div key={student.id_usuario} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-transform transform hover:scale-[1.02]">
        <span className="text-xl font-bold text-gray-500 w-10">{student.rank}</span>
        <img src={student.avatar_url || '/img/avatar/default.png'} alt={`${student.nombre} ${student.apellido}`} className="w-12 h-12 rounded-full mr-4 object-cover" />
        <div className="flex-grow">
          <p className="font-semibold text-gray-800">{student.nombre} {student.apellido}</p>
          <div className="flex items-center text-sm text-gray-500">
            <PointsIcon />
            <span className="ml-1">{student.saldo_punto} puntos</span>
          </div>
        </div>
        <MedalIcon rank={index + 1} />
      </div>
    ))}
  </div>
);

// --- Componente para la lista de Cursos (reutilizable) ---
const CourseRankingList = ({ courses, type }: { courses: (CourseRatingRank | CoursePopularityRank)[]; type: 'rating' | 'popularity' }) => (
  <div className="space-y-3">
    {courses.map((course, index) => (
      <div key={course.id_curso} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-transform transform hover:scale-[1.02]">
        <span className="text-xl font-bold text-gray-500 w-10">{course.rank}</span>
        <div className="flex-grow">
          <p className="font-semibold text-gray-800">{course.titulo}</p>
          {type === 'rating' && 'calificacion_promedio' in course && (
            <div className="flex items-center text-sm text-gray-500">
              <StarIcon />
              <span className="ml-1">{parseFloat(course.calificacion_promedio).toFixed(1)} estrellas</span>
            </div>
          )}
          {type === 'popularity' && 'cantidad_estudiantes' in course && (
             <div className="flex items-center text-sm text-gray-500">
              <UsersIcon />
              <span className="ml-1">{course.cantidad_estudiantes} estudiantes</span>
            </div>
          )}
        </div>
        <MedalIcon rank={index + 1} />
      </div>
    ))}
  </div>
);

export default function RankingPage() {
  const [rankingType, setRankingType] = useState<RankingType>('students');
  const [studentRanking, setStudentRanking] = useState<StudentRank[]>([]);
  const [courseRatingRanking, setCourseRatingRanking] = useState<CourseRatingRank[]>([]);
  const [coursePopularityRanking, setCoursePopularityRanking] = useState<CoursePopularityRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRankings = async () => {
      setLoading(true);
      const [students, ratings, popularity] = await Promise.all([
        rankingService.getStudentRanking(),
        rankingService.getCourseRatingRanking(),
        rankingService.getCoursePopularityRanking(),
      ]);
      setStudentRanking(students);
      setCourseRatingRanking(ratings);
      setCoursePopularityRanking(popularity);
      setLoading(false);
    };

    fetchAllRankings();
  }, []);

  const tabs = useMemo(() => [
    { id: 'students', label: 'Mejores Estudiantes' },
    { id: 'course_rating', label: 'Cursos Populares' },
    { id: 'course_popularity', label: 'Cursos Mejor Calificados' },
  ], []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
          <p>Cargando ranking...</p>
        </div>
      );
    }

    switch (rankingType) {
      case 'students':
        return studentRanking.length > 0 ? <StudentRankingList students={studentRanking} /> : <p>No hay datos de estudiantes.</p>;
      case 'course_rating':
        return courseRatingRanking.length > 0 ? <CourseRankingList courses={courseRatingRanking} type="rating" /> : <p>No hay datos de cursos.</p>;
      case 'course_popularity':
        return coursePopularityRanking.length > 0 ? <CourseRankingList courses={coursePopularityRanking} type="popularity" /> : <p>No hay datos de cursos.</p>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto pt-24 px-4 pb-20">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Ranking Global</h1>
          <p className="mt-2 text-lg text-gray-600">
            Descubre quiénes lideran nuestra comunidad de aprendizaje.
          </p>

          {/* Pestañas de Navegación */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRankingType(tab.id as RankingType)}
                  className={`${
                    rankingType === tab.id
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido del Ranking */}
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </div>
      <BottomNavbar />
    </>
  );
}