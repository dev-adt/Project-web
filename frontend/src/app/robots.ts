import { MetadataRoute } from 'next';

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
    // Fetch dynamic crawlers configuration with caching
    const res = await fetch(`${API_URL}/seo/robots`, { 
      next: { revalidate: 3600 } 
    });
    const json = await res.json();

    if (json.success && json.data) {
      const { rules, sitemap } = json.data;
      return {
        rules: rules.map((rule: any) => ({
          userAgent: rule.userAgent,
          allow: rule.allow || undefined,
          disallow: rule.disallow || [],
        })),
        sitemap,
      };
    }
  } catch (err) {
    console.error('Failed to compile robots.txt:', err);
  }

  // Fallback defaults
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/v1/auth', '/admin'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
