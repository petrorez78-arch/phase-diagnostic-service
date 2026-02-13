interface Props {
  signals: string[];
}

export default function SignalCard({ signals }: Props) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Слабых сигналов не обнаружено
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {signals.map((signal, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border/50"
        >
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "oklch(0.78 0.16 75)" }} />
          <p className="text-sm text-foreground/90 leading-relaxed">{signal}</p>
        </div>
      ))}
    </div>
  );
}
