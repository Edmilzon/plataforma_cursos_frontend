import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Polimathia - Plataforma Educativa",
  description: "Aprende y certifícate con los mejores cursos online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>  
          <Navbar />
          {/* Añadimos un padding-top al main para que el contenido no quede debajo del navbar fijo */}
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}