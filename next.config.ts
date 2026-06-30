import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'pg-hstore'],
  allowedDevOrigins: ['192.168.1.151'],
  // experimental: {
  //   turbo: {
  //     resolveAlias: {
  //       pg: require.resolve('pg'),
  //       'pg-hstore': require.resolve('pg-hstore'),
  //     },
  //   },
  // },
};

export default nextConfig;
