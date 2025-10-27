'use client';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavbarDocente() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path;
    return (
        <nav className="bg-white text-black shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex space-x-6">
                        <Link href="/home-docente" className={`hover:text-blue-200 transition-colors ${isActive('/home-docente') ? 'border-b-2 border-blue-600' : ''}`}>Mis Cursos</Link>
                        <Link href="/home-docente/crear-curso" className={`hover:text-blue-200 transition-colors ${isActive('/home-docente/crear-curso') ? 'border-b-2 border-blue-600' : ''}`}>Crear Curso</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}