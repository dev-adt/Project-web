import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  settings: {
    title: string;
    items: FAQItem[];
    backgroundColor: string;
    textColor: string;
    paddingTop: number;
    paddingBottom: number;
  };
}

export const FAQ: React.FC<FAQProps> = ({ settings }) => {
  const {
    title,
    items,
    backgroundColor,
    textColor,
    paddingTop,
    paddingBottom,
  } = settings;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const style = {
    backgroundColor: backgroundColor || '#09090b',
    color: textColor || '#fafafa',
    paddingTop: `${paddingTop || 60}px`,
    paddingBottom: `${paddingBottom || 60}px`,
  };

  const toggle = (idx: number) => {
    setActiveIndex(activeIndex === idx ? null : idx);
  };

  return (
    <section style={style} className="w-full relative transition-all duration-300">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-extrabold tracking-tight mb-12 text-center">
          {title}
        </h2>
        <div className="flex flex-col gap-4">
          {items?.map((item, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/5 bg-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4 flex justify-between items-center text-left font-semibold text-base transition-colors hover:bg-white/5"
                >
                  <span>{item.question}</span>
                  <ChevronDown className={`h-5 w-5 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-6 py-4 text-sm opacity-80 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
