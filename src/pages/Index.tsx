import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import InkPool, { InkPoolHandle } from '@/components/InkPool';
import InkSlider from '@/components/InkSlider';
import ClarityBar from '@/components/ClarityBar';
import PastWaters from '@/components/PastWaters';
import PastWaterModal from '@/components/PastWaterModal';
import {
  DEFAULT_PLATFORMS,
  Platform,
  DayEntry,
  getReflection,
  getClarity,
  loadEntries,
  saveEntry,
  deleteEntry,
} from '@/lib/platforms';

const CUSTOM_COLORS = [
  'hsl(280, 60%, 55%)',
  'hsl(30, 80%, 55%)',
  'hsl(150, 60%, 45%)',
  'hsl(60, 70%, 50%)',
];

const Index = () => {
  const poolRef = useRef<InkPoolHandle>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    DEFAULT_PLATFORMS.forEach((p) => (init[p.id] = 0));
    return init;
  });
  const [entries, setEntries] = useState<DayEntry[]>(loadEntries);
  const [selectedEntry, setSelectedEntry] = useState<DayEntry | null>(null);
  const [saveLabel, setSaveLabel] = useState<'save' | 'stored'>('save');
  const [customName, setCustomName] = useState('');

  const clarity = getClarity(values);
  const reflection = getReflection(clarity);

  const handleSliderChange = useCallback((id: string, val: number) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  }, []);

  const handleSave = useCallback(() => {
    const snapshot = poolRef.current?.getSnapshot() || '';
    const today = new Date().toISOString().split('T')[0];
    const entry: DayEntry = {
      date: today,
      platforms: { ...values },
      clarity,
      snapshot,
      reflection,
    };
    saveEntry(entry);
    setEntries(loadEntries());
    setSaveLabel('stored');
    setTimeout(() => setSaveLabel('save'), 2000);
  }, [values, clarity, reflection]);

  const handleDelete = useCallback((date: string) => {
    deleteEntry(date);
    setEntries(loadEntries());
    setSelectedEntry(null);
  }, []);

  const handleAddCustom = useCallback(() => {
    const name = customName.trim();
    if (!name || platforms.some((p) => p.id === name.toLowerCase())) return;
    const colorIdx = (platforms.length - DEFAULT_PLATFORMS.length) % CUSTOM_COLORS.length;
    const newPlatform: Platform = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      label: name,
      color: CUSTOM_COLORS[colorIdx],
      hslVar: '',
      isCustom: true,
    };
    setPlatforms((prev) => [...prev, newPlatform]);
    setValues((prev) => ({ ...prev, [newPlatform.id]: 0 }));
    setCustomName('');
  }, [customName, platforms]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Pool */}
      <div className="relative w-full" style={{ height: '50vh', minHeight: 300 }}>
        <InkPool
          ref={poolRef}
          platforms={platforms}
          values={values}
          className="h-full"
          interactive
        />
        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.h1
            className="font-display text-3xl md:text-4xl text-foreground/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          >
            mind pool
          </motion.h1>
          <motion.p
            className="font-mono-ui text-muted-foreground/20 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            your media, as water
          </motion.p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 px-6 md:px-12 lg:px-24 py-8 max-w-xl mx-auto w-full space-y-8">
        {/* Reflection */}
        <motion.p
          key={reflection}
          className="font-display text-lg text-foreground/50 text-center italic"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          {reflection}
        </motion.p>

        {/* Clarity */}
        <ClarityBar clarity={clarity} />

        {/* Sliders */}
        <div>
          {platforms.map((platform) => (
            <InkSlider
              key={platform.id}
              label={platform.label}
              color={platform.color}
              value={values[platform.id] || 0}
              onChange={(val) => handleSliderChange(platform.id, val)}
            />
          ))}
        </div>

        {/* Add custom */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="add platform..."
            className="flex-1 bg-transparent ink-border rounded-lg px-3 py-2 font-mono-ui text-foreground/60 placeholder:text-muted-foreground/20 focus:outline-none focus:border-muted-foreground/20 transition-colors"
          />
          <button
            onClick={handleAddCustom}
            className="px-4 py-2 font-mono-ui text-muted-foreground/30 ink-border rounded-lg transition-colors hover:text-foreground/60"
          >
            +
          </button>
        </div>

        {/* Save */}
        <motion.button
          onClick={handleSave}
          className="w-full py-3 font-mono-ui ink-border rounded-lg transition-all duration-500"
          style={{
            color: saveLabel === 'stored' ? 'hsl(180, 60%, 50%)' : undefined,
            borderColor: saveLabel === 'stored' ? 'hsl(180, 60%, 50%, 0.2)' : undefined,
          }}
          whileTap={{ scale: 0.98 }}
        >
          {saveLabel === 'stored' ? 'stored' : "save today's water"}
        </motion.button>

        {/* Past Waters */}
        <PastWaters entries={entries} onSelect={setSelectedEntry} />
      </div>

      {/* Modal */}
      {selectedEntry && (
        <PastWaterModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Index;
