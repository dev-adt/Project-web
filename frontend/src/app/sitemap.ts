import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';
    // Fetch dynamically from backend with 1 hour caching
    const res = await fetch(`${API_URL}/seo/sitemap`, { 
      next: { revalidate: 3600 } 
    });
    const json = await res.json();

    if (json.success && json.data?.links) {
      return json.data.links.map((link: any) => ({
        url: link.url,
        lastModified: new Date(link.lastmod),
        changeFrequency: 'weekly' as const,
        priority: link.url.endsWith('/') ? 1.0 : 0.8,
      }));
    }
  } catch (err) {
    console.error('Failed to dynamic compile sitemap.xml:', err);
  }

  // Fallback default routing if API fails
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost';
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];
}
