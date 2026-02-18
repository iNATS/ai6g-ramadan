import React, { useRef, useState, useEffect } from 'react';
import { TextConfig } from '../types';
import { Move, Type, Palette } from 'lucide-react';

interface EditorProps {
  imageSrc: string;
  config: TextConfig;
  onConfigChange: (config: TextConfig) => void;
}

export const Editor: React.FC<EditorProps> = ({ imageSrc, config, onConfigChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Constrain to 0-1
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    onConfigChange({ ...config, x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-6">
      {/* Visual Editor */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-crosshair select-none bg-gray-100"
        onMouseMove={handleMouseMove}
        style={{ touchAction: 'none' }}
      >
        <img 
          src={imageSrc} 
          alt="Template" 
          className="w-full h-auto block pointer-events-none"
        />
        
        {/* Draggable Text Placeholder */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap cursor-move group"
          style={{ 
            left: `${config.x * 100}%`, 
            top: `${config.y * 100}%`,
            color: config.color,
            fontSize: `${Math.max(12, config.fontSize / 2)}px` // Scale down font for preview
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="border-2 border-dashed border-violet-400 bg-violet-50/30 px-4 py-2 rounded-lg group-hover:border-violet-600 transition-colors">
            اسم الموظف
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            اسحب لتغيير المكان
          </div>
        </div>

        {/* Footer Preview (Static) */}
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-500 pointer-events-none">
          احصل على دعوتك مجانا AI6G تم الانشاء بواسطه
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-gray-100">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Type className="w-4 h-4 text-violet-600" />
            حجم الخط
          </label>
          <input 
            type="range" 
            min="20" 
            max="120" 
            value={config.fontSize}
            onChange={(e) => onConfigChange({ ...config, fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
          <div className="text-right text-xs text-gray-500">{config.fontSize}px</div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Palette className="w-4 h-4 text-violet-600" />
            لون النص
          </label>
          <div className="flex gap-2">
            {['#000000', '#1f2937', '#4c1d95', '#1e40af', '#047857', '#b91c1c'].map((color) => (
              <button
                key={color}
                onClick={() => onConfigChange({ ...config, color })}
                className={`w-8 h-8 rounded-full border-2 ${config.color === color ? 'border-violet-600 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
            <input 
              type="color"
              value={config.color}
              onChange={(e) => onConfigChange({ ...config, color: e.target.value })}
              className="w-8 h-8 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};