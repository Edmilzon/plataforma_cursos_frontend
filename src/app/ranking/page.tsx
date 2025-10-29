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
const MedalIcon = ({ rank, className = '' }: { rank: number | string; className?: string }) => {
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
      className={`w-6 h-6 ${colors[rank as keyof typeof colors] || 'text-gray-300'} ${className}`}
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

// Nuevo icono de corona para el primer lugar
const CrownIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-yellow-500 ${className}`}>
    <path d="m2.5 17 1.557-1.557a2.4 2.4 0 0 1 3.394 0L8.5 17l1.557-1.557a2.4 2.4 0 0 1 3.394 0L15.5 17l1.557-1.557a2.4 2.4 0 0 1 3.394 0L21.5 17" />
    <path d="M22 10V7h-2V4h-3V2H7v2H4v3H2v3l2 2 2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2z" />
  </svg>
);

// Modificado para aceptar className
const StarIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-yellow-500 ${className}`}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

// Modificado para aceptar className
const UsersIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-blue-500 ${className}`}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);

// Modificado para aceptar className
const PointsIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 text-green-500 ${className}`}><path d="m12 14 4-4"></path><path d="M12 14 8 10"></path><path d="M12 22a4.8 4.8 0 0 0 4-2 4.8 4.8 0 0 0 0-6 4.8 4.8 0 0 0-8 0 4.8 4.8 0 0 0 0 6 4.8 4.8 0 0 0 4 2Z"></path><path d="M12 2a4.8 4.8 0 0 1 4 2 4.8 4.8 0 0 1 0 6 4.8 4.8 0 0 1-8 0 4.8 4.8 0 0 1 0-6 4.8 4.8 0 0 1 4-2Z"></path></svg>
);

// --- Componente para una tarjeta de estudiante del Top 3 ---
const TopStudentCard = ({ student, rank }: { student: StudentRank; rank: number }) => {
  const rankStyles = {
    1: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white border-yellow-600 scale-110 shadow-lg-gold',
    2: 'bg-gradient-to-br from-gray-300 to-gray-400 text-white border-gray-500 scale-105 shadow-lg-silver',
    3: 'bg-gradient-to-br from-orange-300 to-orange-500 text-white border-orange-600 shadow-lg-bronze',
  };

  const currentRankStyle = rankStyles[rank as keyof typeof rankStyles] || 'bg-white text-gray-800 border-gray-200';

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${currentRankStyle} w-full`}>
      {rank === 1 && <CrownIcon className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10" />}
      <span className="text-3xl font-extrabold mb-2">{rank}º</span>
      <img
        src={student.avatar_url || '/img/avatar/default.png'}
        alt={`${student.nombre} ${student.apellido}`}
        className="w-20 h-20 rounded-full object-cover border-2 border-white mb-2"
      />
      <p className="font-bold text-lg text-center">{student.nombre} {student.apellido}</p>
      <div className="flex items-center text-sm mt-1">
        <PointsIcon className="w-4 h-4 mr-1" />
        <span>{student.saldo_punto} puntos</span>
      </div>
    </div>
  );
};

// --- Componente para una tarjeta de curso del Top 3 ---
const TopCourseCard = ({ course, rank, type }: { course: CourseRatingRank | CoursePopularityRank; rank: number; type: 'rating' | 'popularity' }) => {
  const rankStyles = {
    1: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white border-yellow-600 scale-110 shadow-lg-gold',
    2: 'bg-gradient-to-br from-gray-300 to-gray-400 text-white border-gray-500 scale-105 shadow-lg-silver',
    3: 'bg-gradient-to-br from-orange-300 to-orange-500 text-white border-orange-600 shadow-lg-bronze',
  };

  const currentRankStyle = rankStyles[rank as keyof typeof rankStyles] || 'bg-white text-gray-800 border-gray-200';

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${currentRankStyle} w-full`}>
      {rank === 1 && <CrownIcon className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10" />}
      <span className="text-3xl font-extrabold mb-2">{rank}º</span>
      <p className="font-bold text-lg text-center mb-1 line-clamp-1">{course.titulo}</p>
      <p className="text-sm text-center mb-2 line-clamp-2">{course.descripcion}</p>
      {type === 'rating' && 'calificacion_promedio' in course && (
        <div className="flex items-center text-sm">
          <StarIcon className="w-4 h-4 mr-1" />
          <span>{parseFloat(course.calificacion_promedio).toFixed(1)} estrellas</span>
        </div>
      )}
      {type === 'popularity' && 'cantidad_estudiantes' in course && (
        <div className="flex items-center text-sm">
          <UsersIcon className="w-4 h-4 mr-1" />
          <span>{course.cantidad_estudiantes} estudiantes</span>
        </div>
      )}
    </div>
  );
};

// --- Componente para mostrar el Top 3 ---
const Top3Display = ({ items, type }: { items: (StudentRank | CourseRatingRank | CoursePopularityRank)[]; type: RankingType }) => {
  if (items.length === 0) return null;

  const first = items.find(item => parseInt(item.rank) === 1);
  const second = items.find(item => parseInt(item.rank) === 2);
  const third = items.find(item => parseInt(item.rank) === 3);

  return (
    <div className="flex justify-center items-end gap-4 mt-8 mb-12">
      {second && (
        <div className="flex-1 max-w-[200px] flex justify-center">
          {type === 'students' ? (
            <TopStudentCard student={second as StudentRank} rank={2} />
          ) : (
            <TopCourseCard course={second as CourseRatingRank | CoursePopularityRank} rank={2} type={type === 'course_rating' ? 'rating' : 'popularity'} />
          )}
        </div>
      )}
      {first && (
        <div className="flex-1 max-w-[220px] flex justify-center">
          {type === 'students' ? (
            <TopStudentCard student={first as StudentRank} rank={1} />
          ) : (
            <TopCourseCard course={first as CourseRatingRank | CoursePopularityRank} rank={1} type={type === 'course_rating' ? 'rating' : 'popularity'} />
          )}
        </div>
      )}
      {third && (
        <div className="flex-1 max-w-[200px] flex justify-center">
          {type === 'students' ? (
            <TopStudentCard student={third as StudentRank} rank={3} />
          ) : (
            <TopCourseCard course={third as CourseRatingRank | CoursePopularityRank} rank={3} type={type === 'course_rating' ? 'rating' : 'popularity'} />
          )}
        </div>
      )}
    </div>
  );
};

// --- Componente para la lista de Estudiantes (ahora muestra lo que recibe) ---
const StudentRankingList = ({ students }: { students: StudentRank[] }) => {
  if (!students || students.length === 0) return null;
  return (
  <div className="space-y-3">
    {students.map((student) => (
      <div key={student.id_usuario} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-transform transform hover:scale-[1.02]">
        <span className="text-xl font-bold text-gray-500 w-10">{student.rank}</span>
        <img src={student.avatar_url || '/img/avatar/default.png'} alt={`${student.nombre} ${student.apellido}`} className="w-12 h-12 rounded-full mr-4 object-cover" />
        <div className="flex-grow">
          <p className="font-semibold text-gray-800">{student.nombre} {student.apellido}</p>
          <div className="flex items-center text-sm text-gray-500">
            <PointsIcon className="w-4 h-4 mr-1" />
            <span className="ml-1">{student.saldo_punto} puntos</span>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
};

// --- Componente para la lista de Cursos (reutilizable, ahora muestra lo que recibe) ---
const CourseRankingList = ({ courses, type }: { courses: (CourseRatingRank | CoursePopularityRank)[]; type: 'rating' | 'popularity' }) => {
  if (!courses || courses.length === 0) return null;
  return (
  <div className="space-y-3">
    {courses.map((course) => (
      <div key={course.id_curso} className="flex items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 transition-transform transform hover:scale-[1.02]">
        <span className="text-xl font-bold text-gray-500 w-10">{course.rank}</span>
        <div className="flex-grow">
          <p className="font-semibold text-gray-800">{course.titulo}</p>
          {type === 'rating' && 'calificacion_promedio' in course && (
            <div className="flex items-center text-sm text-gray-500">
              <StarIcon className="w-4 h-4 mr-1" />
              <span className="ml-1">{parseFloat(course.calificacion_promedio).toFixed(1)} estrellas</span>
            </div>
          )}
          {type === 'popularity' && 'cantidad_estudiantes' in course && (
             <div className="flex items-center text-sm text-gray-500">
              <UsersIcon className="w-4 h-4 mr-1" />
              <span className="ml-1">{course.cantidad_estudiantes} estudiantes</span>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
  );
};

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
    { id: 'course_rating', label: 'Cursos Mejor Calificados' },
    { id: 'course_popularity', label: 'Cursos Populares' },
  ], []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="mt-8 p-8 border rounded-lg bg-gray-50 text-center text-gray-500">
          <p>Cargando ranking...</p>
        </div>
      );
    }

    let top3Items: (StudentRank | CourseRatingRank | CoursePopularityRank)[] = [];
    let restOfList: (StudentRank | CourseRatingRank | CoursePopularityRank)[] = [];
    let currentData: (StudentRank | CourseRatingRank | CoursePopularityRank)[] = [];

    switch (rankingType) {
      case 'students':
        currentData = studentRanking;
        top3Items = currentData.filter(s => parseInt(s.rank) <= 3);
        restOfList = currentData.filter(s => parseInt(s.rank) > 3);
        return (
          <>
            <Top3Display items={top3Items} type="students" />
            <StudentRankingList students={restOfList as StudentRank[]} />
            {currentData.length === 0 && <p className="text-center text-gray-500 mt-8">No hay datos de estudiantes.</p>}
          </>
        );
      case 'course_rating':
        currentData = courseRatingRanking;
        top3Items = currentData.filter(c => parseInt(c.rank) <= 3);
        restOfList = currentData.filter(c => parseInt(c.rank) > 3);
        return (
          <>
            <Top3Display items={top3Items} type="course_rating" />
            <CourseRankingList courses={restOfList as CourseRatingRank[]} type="rating" />
            {currentData.length === 0 && <p className="text-center text-gray-500 mt-8">No hay datos de cursos.</p>}
          </>
        );
      case 'course_popularity':
        currentData = coursePopularityRanking;
        top3Items = currentData.filter(c => parseInt(c.rank) <= 3);
        restOfList = currentData.filter(c => parseInt(c.rank) > 3);
        return (
          <>
            <Top3Display items={top3Items} type="course_popularity" />
            <CourseRankingList courses={restOfList as CoursePopularityRank[]} type="popularity" />
            {currentData.length === 0 && <p className="text-center text-gray-500 mt-8">No hay datos de cursos.</p>}
          </>
        );
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