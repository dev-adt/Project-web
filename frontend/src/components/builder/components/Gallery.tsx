import React from 'react';

interface GalleryItem {
  url: string;
  caption?: string;
}

interface GalleryProps {
  settings: {
    title: string;
    columns: number | string;
    items: GalleryItem[];
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
  };
}

export const Gallery: React.FC<GalleryProps> = ({ settings }) => {
  const {
    title,
    columns,
    items,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
  } = settings;

  const style = {
    backgroundColor: backgroundColor || '#09090b',
    color: textColor || '#fafafa',
    paddingTop: `${paddingTop || 60}px`,
    paddingBottom: `${paddingBottom || 60}px`,
  };

  const cols = parseInt(columns as string, 10) || 3;
  const gridClass =
    cols === 2
      ? 'md:grid-cols-2'
      : cols === 4
      ? 'md:grid-cols-2 lg:grid-cols-4'
      : 'md:grid-cols-3';

  return (
    <section style={style} className="w-full relative transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold tracking-tight mb-12 text-center">
          {title}
        </h2>
        <div className={`grid gap-6 ${gridClass}`}>
          {items?.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden border border-white/5 bg-white/5 group hover:border-violet-500/25 transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.url}
                  alt={item.caption || 'Gallery slide'}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {item.caption && (
                <div className="p-4 text-xs font-medium opacity-80 text-center leading-normal">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
