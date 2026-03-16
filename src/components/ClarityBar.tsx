import { motion } from 'framer-motion';

interface ClarityBarProps {
  clarity: number;
}

const ClarityBar = ({ clarity }: ClarityBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <span className="font-mono-ui text-muted-foreground/50 shrink-0">clarity</span>
      <div className="flex-1 h-[2px] bg-secondary rounded-full overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, hsl(var(--clarity-glow)), hsl(var(--ink-tiktok) / 0.4))`,
            boxShadow: `0 0 12px hsl(var(--clarity-glow) / 0.5)`,
          }}
          animate={{ width: `${clarity}%` }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <span className="font-mono-ui text-muted-foreground/50 w-8 text-right">{clarity}%</span>
    </div>
  );
};

export default ClarityBar;
