import React from 'react';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { CTA } from './components/CTA';
import { FAQ } from './components/FAQ';
import { Gallery } from './components/Gallery';

interface ComponentViewsProps {
  type: string;
  settings: any;
}

export const ComponentViews: React.FC<ComponentViewsProps> = ({ type, settings }) => {
  switch (type) {
    case 'hero':
      return <Hero settings={settings} />;
    case 'features':
      return <Features settings={settings} />;
    case 'cta':
      return <CTA settings={settings} />;
    case 'faq':
      return <FAQ settings={settings} />;
    case 'gallery':
      return <Gallery settings={settings} />;
    default:
      return (
        <div className="w-full py-8 px-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 italic text-sm">
          Unknown block template section type: &quot;{type}&quot;
        </div>
      );
  }
};
