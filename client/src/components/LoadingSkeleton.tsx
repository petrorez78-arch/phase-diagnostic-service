/**
 * Loading Skeleton Component
 * Animated placeholder for chat messages during n8n processing
 */

export default function LoadingSkeleton() {
  return (
    <div className="flex gap-3 animate-in fade-in duration-500">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-lg bg-primary/20 flex-shrink-0 animate-pulse" />
      
      {/* Message Content */}
      <div className="flex-1 space-y-3">
        {/* Header skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
        </div>
        
        {/* Content lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/40 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-muted/40 rounded animate-pulse delay-75" />
          <div className="h-4 w-4/6 bg-muted/40 rounded animate-pulse delay-150" />
        </div>
        
        {/* Typing indicator */}
        <div className="flex items-center gap-1.5 pt-2">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-100" />
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-200" />
          <span className="text-xs text-muted-foreground ml-2">
            AI анализирует данные...
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Progress Bar Component
 * Shows estimated time remaining for n8n processing
 */
interface ProgressBarProps {
  duration?: number; // Duration in seconds (default: 20)
}

export function ProgressBar({ duration = 20 }: ProgressBarProps) {
  return (
    <div className="w-full space-y-2 py-3">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Обработка запроса...</span>
        <span>~{duration}с</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all ease-linear"
          style={{
            animation: `progress ${duration}s linear forwards`,
          }}
        />
      </div>
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
