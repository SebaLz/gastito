/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // Ajusta esto al nombre de tu repositorio (por ejemplo: /gastito/)
  // Deja vacío si usarás un dominio personalizado
  basePath: process.env.NODE_ENV === "production" ? "/gastito" : "",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
