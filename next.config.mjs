/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Configuration pour react-pdf et pdfjs-dist
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false

    // Externaliser pdfjs-dist côté serveur pour éviter les erreurs de bundling
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'pdfjs-dist': 'commonjs pdfjs-dist',
        'pdfjs-dist/legacy/build/pdf.mjs': 'commonjs pdfjs-dist/legacy/build/pdf.mjs',
      })
    }

    // Configuration spécifique pour pdfjs-dist (éviter les erreurs de module)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      }
    }

    // Gérer les imports .mjs de pdfjs-dist
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })

    return config
  },
}

export default nextConfig
