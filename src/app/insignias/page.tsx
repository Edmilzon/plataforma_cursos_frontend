'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { badgeService, Insignia } from '@/services/badgeService';
import { userService, UpdateProfileData } from '@/services/userService';
import { BottomNavbar } from '@/components/BottomNavbar';

// --- Íconos para la UI ---
const MailIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const RoleIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const BadgeIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${className}`}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l1.21 1.22a1 1 0 0 0 1.42 0l1.21-1.22a4 4 0 0 1 4.78 4.78l-1.22 1.21a1 1 0 0 0 0 1.42l1.22 1.21a4 4 0 0 1-4.78 4.78l-1.21-1.22a1 1 0 0 0-1.42 0l-1.21 1.22a4 4 0 0 1-4.78-4.78l1.22-1.21a1 1 0 0 0 0-1.42z"/></svg>;
const PointsIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${className}`}><path d="m12 14 4-4"/><path d="M12 14 8 10"/><path d="M12 22a4.8 4.8 0 0 0 4-2 4.8 4.8 0 0 0 0-6 4.8 4.8 0 0 0-8 0 4.8 4.8 0 0 0 0 6 4.8 4.8 0 0 0 4 2Z"/><path d="M12 2a4.8 4.8 0 0 1 4 2 4.8 4.8 0 0 1 0 6 4.8 4.8 0 0 1-8 0 4.8 4.8 0 0 1 0-6 4.8 4.8 0 0 1 4-2Z"/></svg>;
const AgeIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /></svg>;
const CalendarIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${className}`}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const EditIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const CloseIcon = ({ className = '' }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 ${className}`}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// --- Componente de Imagen de Insignia con Fallback ---
const InsigniaImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const defaultInsignia = '/img/insignias/default.jpg';
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(defaultInsignia)}
      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
    />
  );
};

// --- Componente de Avatar con Iniciales ---
const Avatar = ({ user }: { user: { nombre: string; avatar_url?: string | null }}) => {
  const [imgError, setImgError] = useState(false);
  const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';

  if (user.avatar_url && !imgError) {
    return (
      <img
        src={user.avatar_url}
        alt="Avatar"
        className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-lg"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-200 shadow-lg">
      <span className="text-5xl font-bold text-white">{initial}</span>
    </div>
  );
};

// --- Modal de Edición de Perfil ---
const EditProfileModal = ({ 
  isOpen, 
  onClose, 
  user,
  onUpdate 
}: { 
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (updatedData: UpdateProfileData) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    edad: user?.edad || '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        edad: user.edad || '',
        password: '',
        confirmPassword: ''
      });
      setError(null);
      setSuccess(null);
    }
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Si el usuario escribió algo en nombre, validar que no esté vacío
    if (formData.nombre !== '' && !formData.nombre.trim()) {
      setError('El nombre no puede estar vacío');
      return false;
    }

    // Si el usuario escribió algo en apellido, validar que no esté vacío
    if (formData.apellido !== '' && !formData.apellido.trim()) {
      setError('El apellido no puede estar vacío');
      return false;
    }

    // Si el usuario escribió algo en edad, validar que sea válida
    if (formData.edad !== '' && formData.edad !== undefined) {
      const edadNum = parseInt(formData.edad);
      if (isNaN(edadNum) || edadNum < 1 || edadNum > 120) {
        setError('La edad debe estar entre 1 y 120 años');
        return false;
      }
    }

    // Si el usuario quiere cambiar contraseña, validar
    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Preparar datos para enviar - solo enviar lo que cambió
      const updateData: UpdateProfileData = {};

      // Solo enviar nombre si es diferente al actual
      if (formData.nombre.trim() !== user?.nombre) {
        updateData.nombre = formData.nombre.trim();
      }

      // Solo enviar apellido si es diferente al actual
      if (formData.apellido.trim() !== user?.apellido) {
        updateData.apellido = formData.apellido.trim();
      }

      // Solo enviar edad si es diferente al actual y no está vacía
      if (formData.edad !== '' && formData.edad !== undefined) {
        const edadNum = parseInt(formData.edad);
        if (edadNum !== user?.edad) {
          updateData.edad = edadNum;
        }
      }

      // Solo enviar password si se proporcionó
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Si no hay cambios, mostrar mensaje y cerrar
      if (Object.keys(updateData).length === 0) {
        setSuccess('No se realizaron cambios');
        setTimeout(() => {
          onClose();
        }, 1500);
        setLoading(false);
        return;
      }

      console.log('📤 Enviando datos actualizados:', updateData);
      await onUpdate(updateData);
      setSuccess('Perfil actualizado correctamente');
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z- flex items-center justify-center bg-white bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <CloseIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={user?.nombre || "Tu nombre"}
            />
            <p className="text-xs text-gray-500 mt-1">Deja en blanco si no quieres cambiar</p>
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={user?.apellido || "Tu apellido"}
            />
            <p className="text-xs text-gray-500 mt-1">Deja en blanco si no quieres cambiar</p>
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edad
            </label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              min="1"
              max="120"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder={user?.edad ? user.edad.toString() : "Tu edad"}
            />
            <p className="text-xs text-gray-500 mt-1">Deja en blanco si no quieres cambiar</p>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••"
            />
            <p className="text-xs text-gray-500 mt-1">Solo si quieres cambiar la contraseña</p>
          </div>

          {/* Confirmar Contraseña - solo mostrar si se está cambiando contraseña */}
          {formData.password && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••"
              />
            </div>
          )}

          {/* Información de solo lectura */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Información que no se puede modificar:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <MailIcon className="text-gray-400 w-4 h-4 mr-2" />
                <span className="text-gray-700">{user?.correo}</span>
              </div>
              <div className="flex items-center">
                <RoleIcon className="text-gray-400 w-4 h-4 mr-2" />
                <span className="text-gray-700">{user?.rol}</span>
              </div>
            </div>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Información sobre cómo funciona */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-600 text-sm">
              💡 <strong>Instrucciones:</strong> Solo completa los campos que quieras cambiar. 
              Los campos que dejes en blanco permanecerán como están.
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const [insignias, setInsignias] = useState<Insignia[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userPoints = useMemo(() => user?.saldo_punto ?? 0, [user]);

  useEffect(() => {
    if (user?.id_usuario) {
      const fetchInsignias = async () => {
        try {
          setLoadingBadges(true);
          const userBadges = await badgeService.getUserBadges(user.id_usuario);
          setInsignias(userBadges);
        } catch (err: any) {
          setError('No se pudieron cargar tus insignias. Inténtalo de nuevo más tarde.');
          console.error(err);
        } finally {
          setLoadingBadges(false);
        }
      };
      fetchInsignias();
    }
  }, [user]);

  const handleUpdateProfile = async (updatedData: UpdateProfileData) => {
    if (!user?.id_usuario) throw new Error('Usuario no identificado');
    
    try {
      // Llama al servicio para actualizar en el backend
      const updatedUser = await userService.updateProfile(user.id_usuario, updatedData);
      
      // Actualiza el estado local usando updateUser
      updateUser(updatedUser);
      
      return updatedUser;
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      throw err;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-800">
        {authLoading ? 'Cargando perfil...' : 'Por favor, inicia sesión para ver tu perfil.'}
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
      
      <div className="bg-white min-h-screen text-gray-800">
        <div className="container mx-auto pt-20 px-4 pb-24">
          {/* --- Sección de Perfil --- */}
          <div className="relative bg-white p-6 rounded-3xl shadow-2xl shadow-blue-500/20 border border-gray-200 animate-fade-in-down">
            {/* Botón de editar en la esquina superior derecha */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <EditIcon className="w-4 h-4" />
                <span className="font-medium">Editar</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar user={user} />
              <div className="flex-grow">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                  {user.nombre} {user.apellido}
                </h1>
                <div className="mt-3 space-y-2 text-gray-600">
                    <div className="flex items-center justify-center sm:justify-start">
                        <MailIcon className="text-gray-400" />
                        <span className="ml-2">{user.correo}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start">
                        <RoleIcon className="text-gray-400" />
                        <span className="ml-2 font-medium text-blue-600">{user.rol}</span>
                    </div>
                    {user.edad && (
                        <div className="flex items-center justify-center sm:justify-start">
                            <AgeIcon className="text-gray-400" />
                            <span className="ml-2">{user.edad} años</span>
                        </div>
                    )}
                </div>
              </div>
            </div>
            {/* --- Estadísticas --- */}
            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center text-blue-500">
                  <BadgeIcon className="w-7 h-7" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{insignias.length}</p>
                <p className="text-sm text-gray-500">Insignias</p>
              </div>
              <div>
                <div className="flex items-center justify-center text-green-500">
                  <PointsIcon className="w-7 h-7" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{userPoints}</p>
                <p className="text-sm text-gray-500">Puntos</p>
              </div>
            </div>
          </div>

          {/* --- Sección de Insignias --- */}
          <div className="mt-10 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Galería de Insignias</h2>
            {loadingBadges ? (
              <div className="text-center text-gray-500">Cargando insignias...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : insignias.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {insignias.map((insignia, index) => (
                  <div
                    key={insignia.id_insignia}
                    className="group relative bg-white p-6 rounded-2xl border border-gray-200 text-center transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/30"
                    style={{ animationDelay: `${index * 50}ms`, animation: 'fade-in-up 0.5s ease-out forwards', opacity: 0 }}
                  >
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <InsigniaImage src={insignia.imagen_url} alt={insignia.nombre} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{insignia.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1">{insignia.descripcion}</p>
                    <div className="flex items-center justify-center text-xs text-gray-400 mt-2">
                      <CalendarIcon className="mr-1" />
                      <span>{new Date(insignia.fecha_otorgacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">Aún no has ganado ninguna insignia. ¡Sigue aprendiendo!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />

      <BottomNavbar />
    </>
  );
}