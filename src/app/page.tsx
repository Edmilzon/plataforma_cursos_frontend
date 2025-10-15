import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* la parte del navar*/}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Navegación JUNTOS a la IZQUIERDA */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">Polimathia</h1>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <span className="text-gray-700 font-medium">Aprende</span>
                <span className="text-gray-700 font-medium">Certifícate</span>
              </nav>
            </div>

            {/* botones de sesion y register */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login " 
                className="text-gray-700 hover:text-blue-600 font-medium">
                Iniciar Sesión
              </Link>
              <Link 
                href=""
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Regístrate
              </Link>
            </div>
          </div>
        </div>
</header>

      <section className="relative min-h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/fondoLandingPageM.png')",
            top: "64px" // altura del navbar
          }}>
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
  
        {/* texto a la izquierda*/}
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

      {/* parte de los docente */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 max-w-6xl mx-auto">

            {/* las card estan a la izquierda */}
            <div className="flex-1 w-full">
              <div className="flex flex-col space-y-8">

                {/* card 1 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      FG
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Fernando Gutierrez</h4>
                      <p className="text-blue-600 font-medium mb-1">Senior Software Engineer</p>
                      <p className="text-gray-600 text-sm">Más de 5 cursos de Java</p>
                    </div>
                  </div>
                </div>

                {/* card 2 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 ml-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      FG
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Fernando Gutierrez</h4>
                      <p className="text-green-600 font-medium mb-1">Senior Software Engineer</p>
                      <p className="text-gray-600 text-sm">Más de 5 cursos de Java</p>
                    </div>
                  </div>
                </div>

                {/* card 3 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 ml-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      FG
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-1">Fernando Gutierrez</h4>
                      <p className="text-purple-600 font-medium mb-1">Senior Software Engineer</p>
                      <p className="text-gray-600 text-sm">Más de 5 cursos de Java</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* texto a la derecha */}
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

      {/* Cursos - Mismo diseño pero ajustado */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 " >
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Nuevos cursos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pb-5" >
            {/* Curso 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Curso de Java</h4>
              <p className="text-gray-600 mb-4">Domina Java desde cero hasta nivel avanzado</p>
            </div>

            {/* Curso 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Curso de Java</h4>
              <p className="text-gray-600 mb-4">Domina Java desde cero hasta nivel avanzado</p>
            </div>

            {/* Curso 3 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Curso de Java</h4>
              <p className="text-gray-600 mb-4">Domina Java desde cero hasta nivel avanzado</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Curso 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Curso de Java</h4>
              <p className="text-gray-600 mb-4">Domina Java desde cero hasta nivel avanzado</p>
            </div>

            {/* Curso 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Curso de Java</h4>
              <p className="text-gray-600 mb-4">Domina Java desde cero hasta nivel avanzado</p>  
            </div>

            {/* Curso 3 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Curso de Java</h4>
              <p className="text-gray-600 mb-4">Domina Java desde cero hasta nivel avanzado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <h4 className="text-xl font-bold">Polimathia</h4>
              </div>
              <p className="text-gray-400 mb-4">
                No hay límites para lo que puedas aprender
              </p>
            </div>

            {/* Planes de estudio */}
            <div>
              <h5 className="font-bold text-lg mb-4">Planes de estudio</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Desarrollo de Web Frontend</li>
                <li>Java Professional</li>
                <li>Ciencia de Datos</li>
                <li>Base de Datos</li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h5 className="font-bold text-lg mb-4">Polimathia</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Cursos</li>
                <li>Términos y Condiciones</li>
                <li>Aviso de privacidad</li>
                <li>Contacto</li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h5 className="font-bold text-lg mb-4">Contacto</h5>
              <p className="text-gray-400">Email: info@polimathia.com</p>
              <p className="text-gray-400">Tel: +1 234 567 890</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


