import { memo } from 'react';

interface AlignmentGridProps {
  showGrid?: boolean;
  showFloorLine?: boolean;
}

export const AlignmentGrid = memo(({ showGrid = true, showFloorLine = true }: AlignmentGridProps) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Subtle Grid */}
      {showGrid && (
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern
              id="grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-white"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

      {/* Horizontal Guidelines */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <div className="absolute top-3/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      {/* Floor Line */}
      {showFloorLine && (
        <div className="absolute bottom-[15%] left-0 right-0">
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-1" />
          <div className="text-center mt-2">
            <span className="text-xs text-white/40 bg-black/30 px-2 py-1 rounded">
              FLOOR REFERENCE
            </span>
          </div>
        </div>
      )}

      {/* Corner Frames with Glow */}
      <div className="absolute top-4 left-4 w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-transparent shadow-glow" />
        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-primary to-transparent shadow-glow" />
      </div>
      <div className="absolute top-4 right-4 w-16 h-16">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary to-transparent shadow-glow" />
        <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-primary to-transparent shadow-glow" />
      </div>
      <div className="absolute bottom-4 left-4 w-16 h-16">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-transparent shadow-glow" />
        <div className="absolute bottom-0 left-0 h-full w-0.5 bg-gradient-to-t from-primary to-transparent shadow-glow" />
      </div>
      <div className="absolute bottom-4 right-4 w-16 h-16">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-primary to-transparent shadow-glow" />
        <div className="absolute bottom-0 right-0 h-full w-0.5 bg-gradient-to-t from-primary to-transparent shadow-glow" />
      </div>
    </div>
  );
});

AlignmentGrid.displayName = 'AlignmentGrid';
