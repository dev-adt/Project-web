import React from 'react';

interface HeroProps {
  settings: {
    title: string;
    subtitle?: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    image?: string;
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
    textAlign: 'left' | 'center' | 'right';
  };
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  const {
    title,
    subtitle,
    description,
    buttonText,
    buttonUrl,
    image,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
    textAlign,
  } = settings;

  const style = {
    backgroundColor: backgroundColor || '#7c3aed',
    color: textColor || '#ffffff',
    paddingTop: `${paddingTop || 80}px`,
    paddingBottom: `${paddingBottom || 80}px`,
  };

  const alignClass =
    textAlign === 'center' ? 'text-center items-center' : textAlign === 'right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <section style={style} className="w-full relative transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 grid gap-12 md:grid-cols-12 items-center">
        <div className={`md:col-span-7 flex flex-col ${alignClass} gap-6`}>
          {subtitle && (
            <span className="text-sm font-bold tracking-widest uppercase opacity-90 px-3 py-1 rounded-full bg-white/10 w-fit">
              {subtitle}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-lg opacity-85 leading-relaxed max-w-2xl">
            {description}
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href={buttonUrl}
              onClick={(e) => e.preventDefault()}
              className="px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-zinc-100 transition-all shadow-lg active:scale-95"
            >
              {buttonText}
            </a>
          </div>
        </div>
        {image && (
          <div className="md:col-span-5 flex justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 max-w-md w-full aspect-video md:aspect-square">
              <img
                src={image}
                alt="Hero section banner illustration"
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
