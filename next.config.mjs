const DEFAULT_WORDPRESS_HOST = "rodovia-veiculos-wordpress.75516c.easypanel.host";

/** Vehicle photos are served from the WordPress uploads folder of the GraphQL host. */
function wordpressHostname() {
  try {
    return new URL((process.env.WORDPRESS_API_URL ?? "").trim()).hostname;
  } catch {
    return DEFAULT_WORDPRESS_HOST;
  }
}

const wordpressHosts = [...new Set([wordpressHostname(), DEFAULT_WORDPRESS_HOST])];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: wordpressHosts.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/wp-content/uploads/**",
    })),
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
