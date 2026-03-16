import { motion } from 'framer-motion';

interface InkSliderProps {
  label: string;
  color: string;
  value: number;
  onChange: (value: number) => void;
}

function formatTime(minutes: number): string {
  if (minutes === 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const InkSlider = ({ label, color, value, onChange }: InkSliderProps) => {
  return (
    <div className="group py-3 ink-border border-t-0 border-l-0 border-r-0">
      <div className="flex justify-between items-center mb-2">
        <motion.span
          className="font-mono-ui text-muted-foreground transition-colors duration-500"
          animate={{
            textShadow: value > 0 ? `0 0 12px ${color}` : 'none',
            color: value > 0 ? color : undefined,
          }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {label}
        </motion.span>
        <span className="font-mono-ui text-muted-foreground/50">
          {value > 0 ? formatTime(value) : '—'}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={300}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-track w-full"
        style={{ color }}
      />
    </div>
  );
};

export default InkSlider;
