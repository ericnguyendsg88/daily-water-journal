import { motion } from 'framer-motion';
import { DayEntry } from '@/lib/platforms';

interface PastWatersProps {
  entries: DayEntry[];
  onSelect: (entry: DayEntry) => void;
}

const PastWaters = ({ entries, onSelect }: PastWatersProps) => {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-mono-ui text-muted-foreground/40">past waters</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {entries.map((entry, i) => (
          <motion.button
            key={entry.date}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            onClick={() => onSelect(entry)}
            className="shrink-0 flex flex-col items-center gap-2 group"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden ink-border pool-shadow transition-transform duration-300 group-hover:scale-105">
              {entry.snapshot ? (
                <img
                  src={entry.snapshot}
                  alt={`Pool from ${entry.date}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-secondary" />
              )}
            </div>
            <div className="text-center">
              <div className="font-mono-ui text-muted-foreground/40">
                {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="font-mono-ui text-muted-foreground/25">{entry.clarity}%</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PastWaters;
