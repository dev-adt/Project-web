import React from 'react';

interface CTAProps {
  settings: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
    textAlign: 'left' | 'center' | 'right';
  };
}

export const CTA: React.FC<CTAProps> = ({ settings }) => {
  const {
    title,
    description,
    buttonText,
    buttonUrl,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
    textAlign,
  } = settings;

  const style = {
    backgroundColor: backgroundColor || '#1e1b4b',
    color: textColor || '#ffffff',
    paddingTop: `${paddingTop || 80}px`,
    paddingBottom: `${paddingBottom || 80}px`,
  };

  const alignClass =
    textAlign === 'center' ? 'text-center items-center' : textAlign === 'right' ? 'text-right items-end' : 'text-left items-start';

  return (
    <section style={style} className="w-full relative transition-all duration-300">
      <div className="max-w-4xl mx-auto px-6">
        <div className={`flex flex-col ${alignClass} gap-6`}>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-lg opacity-85 leading-relaxed max-w-2xl">
            {description}
          </p>
          <a
            href={buttonUrl}
            onClick={(e) => e.preventDefault()}
            className="px-6 py-3 rounded-xl font-semibold bg-white text-black hover:bg-zinc-100 transition-all shadow-lg active:scale-95 mt-4"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
};
