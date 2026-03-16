import { motion, AnimatePresence } from 'framer-motion';
import { DayEntry, DEFAULT_PLATFORMS } from '@/lib/platforms';

interface PastWaterModalProps {
  entry: DayEntry | null;
  onClose: () => void;
  onDelete: (date: string) => void;
}

const PastWaterModal = ({ entry, onClose, onDelete }: PastWaterModalProps) => {
  if (!entry) return null;

  const totalMinutes = Object.values(entry.platforms).reduce((s, v) => s + v, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const driftText = hours > 0
    ? `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins}m` : ''} of drift`
    : `${mins} minutes of drift`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        <motion.div
          className="relative w-full max-w-sm rounded-2xl overflow-hidden ink-border pool-shadow bg-card"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Snapshot */}
          {entry.snapshot && (
            <div className="aspect-[4/3] overflow-hidden">
              <img src={entry.snapshot} alt="Pool snapshot" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Date */}
            <div className="font-mono-ui text-muted-foreground/40">
              {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>

            {/* Reflection */}
            <p className="font-display text-lg text-foreground/70 italic">
              "{entry.reflection}"
            </p>

            {/* Platform breakdown */}
            <div className="space-y-1">
              {DEFAULT_PLATFORMS.map((p) => {
                const val = entry.platforms[p.id] || 0;
                if (val === 0) return null;
                const h = Math.floor(val / 60);
                const m = val % 60;
                return (
                  <div key={p.id} className="flex justify-between font-mono-ui">
                    <span style={{ color: p.color }}>{p.label}</span>
                    <span className="text-muted-foreground/40">
                      {h > 0 ? `${h}h ${m}m` : `${m}m`}
                    </span>
                  </div>
                );
              })}
              {/* Custom platforms */}
              {Object.entries(entry.platforms).map(([id, val]) => {
                if (DEFAULT_PLATFORMS.some(p => p.id === id) || val === 0) return null;
                const h = Math.floor(val / 60);
                const m = val % 60;
                return (
                  <div key={id} className="flex justify-between font-mono-ui">
                    <span className="text-muted-foreground">{id}</span>
                    <span className="text-muted-foreground/40">
                      {h > 0 ? `${h}h ${m}m` : `${m}m`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="font-mono-ui text-muted-foreground/30 text-center">
              {driftText} · {entry.clarity}% clarity
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 font-mono-ui text-muted-foreground/40 ink-border rounded-lg transition-colors hover:text-foreground/60"
              >
                close
              </button>
              <button
                onClick={() => onDelete(entry.date)}
                className="flex-1 py-2 font-mono-ui text-destructive/50 ink-border rounded-lg transition-colors hover:text-destructive"
              >
                dissolve
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PastWaterModal;
