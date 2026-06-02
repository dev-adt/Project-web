'use client';

import { useEffect } from 'react';

export function useTracker(slug: string) {
  useEffect(() => {
    if (typeof window === 'undefined' || !slug) return;

    const trackPage = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api/v1';

        // Retrieve or generate visitor ID for session tracking
        let visitorId = localStorage.getItem('visitor_uuid');
        if (!visitorId) {
          if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            visitorId = crypto.randomUUID();
          } else {
            visitorId = 'visitor-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          }
          localStorage.setItem('visitor_uuid', visitorId);
        }

        const referer = document.referrer || '';

        await fetch(`${API_URL}/analytics/track`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            visitorId,
            referer,
          }),
        });
      } catch (err) {
        // Silently catch tracking errors to avoid disrupting UX
        console.warn('PageView tracking call failed:', err);
      }
    };

    trackPage();
  }, [slug]);
}
