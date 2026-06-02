import React from 'react';
import { useBuilderStore, Section } from '../../stores/builder.store';
import { ComponentViews } from './ComponentViews';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical, EyeOff } from 'lucide-react';

interface SortableSectionProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group/sec cursor-pointer border ${
        isSelected
          ? 'border-violet-500 ring-2 ring-violet-500/20'
          : 'border-transparent hover:border-violet-500/40'
      } rounded-xl overflow-hidden transition-all duration-300 mb-4 shadow-md bg-zinc-950`}
    >
      {/* Floating Controls Toolbar */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/sec:opacity-100 transition-all z-40 bg-zinc-950/80 border border-zinc-800 p-1.5 rounded-lg backdrop-blur">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400"
          title="Delete component"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Component Content Render */}
      <div className="relative">
        {!section.isActive && (
          <div className="absolute inset-0 bg-[#09090b]/40 backdrop-blur-[1px] flex items-center justify-center z-30">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs">
              <EyeOff className="h-4 w-4" />
              <span>Section Hidden</span>
            </div>
          </div>
        )}
        <ComponentViews type={section.sectionType} settings={section.settingsJson} />
      </div>
    </div>
  );
};

export const Canvas: React.FC = () => {
  const {
    sections,
    selectedSectionId,
    responsiveMode,
    selectSection,
    removeSection,
    reorderSections,
  } = useBuilderStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((sec) => sec.id === active.id);
      const newIndex = sections.findIndex((sec) => sec.id === over.id);

      const reordered = arrayMove(sections, oldIndex, newIndex);
      reorderSections(reordered.map((sec) => sec.id));
    }
  };

  // Compute responsive frame scale widths
  const frameWidthClass =
    responsiveMode === 'mobile'
      ? 'max-w-[390px] border-x border-zinc-800'
      : responsiveMode === 'tablet'
      ? 'max-w-[768px] border-x border-zinc-800'
      : 'max-w-full';

  return (
    <div
      onClick={() => selectSection(null)}
      className="flex-1 bg-[#0f0f11] overflow-y-auto p-8 flex justify-center h-[calc(100vh-3.5rem)] select-none"
    >
      <div
        className={`w-full ${frameWidthClass} transition-all duration-500 bg-zinc-950 rounded-2xl shadow-2xl flex flex-col min-h-full`}
      >
        <div className="flex-1 p-6 flex flex-col">
          {sections.length === 0 ? (
            <div className="flex-1 border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl flex flex-col items-center justify-center p-12 text-center transition-all bg-zinc-900/10">
              <span className="text-2xl mb-3">✨</span>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                Canvas Board is Empty
              </h3>
              <p className="text-xs text-zinc-600 mt-2 max-w-xs leading-relaxed">
                Click any layout card in the left component panel to build your dynamic landing pages structure.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((sec) => sec.id)}
                strategy={verticalListSortingStrategy}
              >
                {sections.map((section) => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    isSelected={selectedSectionId === section.id}
                    onSelect={() => selectSection(section.id)}
                    onDelete={() => removeSection(section.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};
