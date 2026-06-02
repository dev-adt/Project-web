import React from 'react';
import { Brain, GitMerge, Clock, Activity, Heart, Shield } from 'lucide-react';

interface FeatureItem {
  title: string;
  description: string;
  icon: string;
}

interface FeaturesProps {
  settings: {
    title: string;
    columns: number | string;
    items: FeatureItem[];
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
  };
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  Brain,
  GitMerge,
  Clock,
  Activity,
  Heart,
  Shield,
};

export const Features: React.FC<FeaturesProps> = ({ settings }) => {
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
        <div className={`grid gap-8 ${gridClass}`}>
          {items?.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Activity;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-white/5 p-6 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col gap-4"
              >
                <div className="p-3 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/15 w-fit">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
