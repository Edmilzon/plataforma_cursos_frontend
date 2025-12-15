import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Esta opción es para Turbopack. Le dice que no intente empaquetar
    // estas librerías y las trate como externas en el servidor.
    serverComponentsExternalPackages: ['chartjs-node-canvas', 'canvas'],
  },
  webpack: (config, { isServer }) => {
    // Esta opción es para Webpack (cuando no se usa Turbopack).
    if (isServer) {
      // Añadimos ambas librerías como externas.
      config.externals.push('chartjs-node-canvas', 'canvas');
    }
    return config;
  },
};

export default nextConfig;