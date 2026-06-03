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
    case 'reusable':
      return (
        <div className="relative border-2 border-violet-500/20 rounded-xl overflow-hidden hover:border-violet-500 transition-all duration-300">
          <div className="absolute top-2 left-2 z-30 px-2 py-0.5 bg-violet-600/90 text-white rounded text-[9px] font-bold uppercase tracking-wider shadow backdrop-blur-sm">
            Block chung: {settings?.blockName || 'Shared Block'}
          </div>
          <ComponentViews type={settings?.masterType} settings={settings?.masterSettings || {}} />
        </div>
      );
    default:
      return (
        <div className="w-full py-8 px-6 bg-zinc-900 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 italic text-sm">
          Unknown block template section type: &quot;{type}&quot;
        </div>
      );
  }
};
