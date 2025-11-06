'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Placeholder Icons
const IconBookOpen = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const IconPlusCircle = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const navItems = [
    { href: '/home-docente', label: 'Mis Cursos', icon: <IconBookOpen /> },
    { href: '/home-docente/crear-curso', label: 'Crear Curso', icon: <IconPlusCircle /> },
];

export default function NavbarDocente() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            href={item.href} 
                            key={item.href} 
                            className={`flex flex-col items-center justify-center transition-colors w-full ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                        >
                            {item.icon}
                            <span className="text-xs mt-1">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}