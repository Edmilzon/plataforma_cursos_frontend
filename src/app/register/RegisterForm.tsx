"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const { register, loading, error } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    confirmPassword: "",
    edad: "",
    rol: "Estudiante", // Rol por defecto
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (form.password !== form.confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }

    const result = await register({
      nombre: form.nombre,
      apellido: form.apellido,
      correo: form.correo,
      password: form.password,
      edad: parseInt(form.edad, 10),
      rol: form.rol as 'Estudiante' | 'Docente',
      avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${form.nombre} ${form.apellido}` // Avatar por defecto
    });

    if (result.success) {
      setSuccessMessage("¡Usuario creado exitosamente! Redirigiendo a login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setFormError(result.error?.message || "No se pudo completar el registro.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden md:flex md:w-1/3 bg-blue-700 items-center justify-center">
        <img
          src="/imagenRegister.svg"
          alt="Registro"
          className="w-full h-full object-contain p-8"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Crea tu cuenta
          </h1>

          {/* Mensajes de Éxito y Error */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
              {successMessage}
            </div>
          )}
          {formError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
              {formError}
            </div>
          )}
          {/* Muestra el error general del hook si existe y no hay un error específico del formulario */}
          {error && !formError && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">{error.message}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Nombres
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Apellidos
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Edad</label>
              <input
                type="number"
                name="edad"
                value={form.edad}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={form.correo}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Rol
              </label>
              <select
                name="rol"
                value={form.rol}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900"
                required
              >
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Confirmar contraseña
                
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className={`w-full font-semibold ${
                loading || successMessage
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            
            >
              {loading ? 'Registrando...' : successMessage ? '¡Éxito!' : 'Registrar'}
            </button>
          </form>

          <p className="text-sm text-center mt-6 w-full">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
