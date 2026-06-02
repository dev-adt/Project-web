import React from 'react';
import { ComponentRegistry } from './ComponentRegistry';
import { useBuilderStore } from '../../stores/builder.store';
import { Plus } from 'lucide-react';

export const LeftPanel: React.FC = () => {
  const { addSection } = useBuilderStore();

  const handleAddComponent = (type: string, defaultSettings: any) => {
    addSection(type, defaultSettings);
  };

  return (
    <div className="w-[280px] border-r border-zinc-800 bg-zinc-950 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Header */}
      <div className="p-4 border-b border-zinc-900 bg-zinc-950">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Component Library
        </h3>
        <p className="text-[10px] text-zinc-600 mt-1">
          Click components to append them to the bottom of the canvas board.
        </p>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {Object.values(ComponentRegistry).map((comp) => {
          const Icon = comp.icon;
          return (
            <div
              key={comp.type}
              onClick={() => handleAddComponent(comp.type, comp.defaultSettings)}
              className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-violet-500/30 hover:bg-violet-500/5 group cursor-pointer transition-all duration-300 shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-900 text-zinc-500 group-hover:text-violet-400 group-hover:bg-violet-500/10 border border-zinc-900 group-hover:border-violet-500/10 transition-colors">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                    {comp.name}
                  </h4>
                  <span className="text-[9px] text-zinc-600 font-mono tracking-wider uppercase">Block Layout</span>
                </div>
              </div>
              <div className="p-1 rounded-md bg-zinc-900 text-zinc-600 group-hover:text-violet-400 transition-colors">
                <Plus className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
