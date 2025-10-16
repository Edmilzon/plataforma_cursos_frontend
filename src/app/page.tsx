import Link from "next/link";
import { TeacherCard, Teacher } from "@/components/landing/TeacherCard";
import { CourseCard, Course } from "@/components/landing/CourseCard";
import { courseService } from "@/services/courseService";
import { userService, ApiUser } from "@/services/userService";

const teacherStyles = [
  { gradient: 'bg-gradient-to-br from-blue-500 to-purple-600', textColor: 'text-blue-600', marginLeft: '' },
  { gradient: 'bg-gradient-to-br from-green-400 to-teal-500', textColor: 'text-green-600', marginLeft: 'lg:ml-8' },
  { gradient: 'bg-gradient-to-br from-purple-500 to-pink-500', textColor: 'text-purple-600', marginLeft: 'lg:ml-4' },
];

const mapApiUsersToTeachers = (apiUsers: ApiUser[]): Teacher[] => {
  return apiUsers.map((user, index) => {
    const style = teacherStyles[index % teacherStyles.length]; 
    return {
      initials: `${user.nombre[0] || ''}${user.apellido[0] || ''}`.toUpperCase(),
      name: `${user.nombre} ${user.apellido}`,
      role: 'Docente experto', 
      courses: 'Varios cursos disponibles',
      ...style,
    };
  });
};

export default async function Home() {
  let courses: Course[] = [];
  let teachers: Teacher[] = [];

  try {
    courses = await courseService.getAllCourses();
    const teacherUsers = await userService.getUsersByRole('Docente');
    teachers = mapApiUsersToTeachers(teacherUsers);
  } catch (error) {
    console.error("Error al obtener datos para la página de inicio:", error);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center -mt-16"> {/* mt-16 para compensar el padding del layout */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/fondoLandingPageM.png')",
          }}>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
  
        <div className="container mx-auto px-10 relative z-10 mt-16">
          <div className="max-w-2xl text-left">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              El conocimiento es el pasaporte a tu futuro
            </h2>
            <p className="text-xl text-white mb-8">
              Bienvenido a la mejor Plataforma Educativa
            </p>
            <Link 
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
              Empieza a aprender
            </Link>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 max-w-6xl mx-auto">
            <div className="flex-1 w-full">
              <div className="flex flex-col space-y-8">
                {teachers.length > 0 ? (
                  teachers.map((teacher, index) => <TeacherCard key={index} teacher={teacher} />)
                ) : (
                  <p className="text-gray-500">Nuestros docentes se están preparando. ¡Vuelve pronto!</p>
                )}
              </div>
            </div>
            <div className="flex-1 text-left lg:pl-12 flex items-center pt-38">
              <div>
                <h3 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Aprende con los mejores del mundo
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Nuestros ingenieros en software cuentan con una amplia experiencia en un promedio de más de 7 años.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 " >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nuevos cursos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {courses.length > 0 ? courses.map((course, index) => (
              <CourseCard key={index} course={course} />
            )) : <p className="col-span-3 text-center text-gray-500">No hay cursos disponibles en este momento.</p>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h4 className="text-xl font-bold">Polimathia</h4>
              </div>
              <p className="text-gray-400 mb-4">
                No hay límites para lo que puedas aprender
              </p>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-4">Planes de estudio</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Desarrollo de Web Frontend</li>
                <li>Java Professional</li>
                <li>Ciencia de Datos</li>
                <li>Base de Datos</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-4">Polimathia</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Cursos</li>
                <li>Términos y Condiciones</li>
                <li>Aviso de privacidad</li>
                <li>Contacto</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-lg mb-4">Contacto</h5>
              <p className="text-gray-400">Email: info@polimathia.com</p>
              <p className="text-gray-400">Tel: +1 234 567 890</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
