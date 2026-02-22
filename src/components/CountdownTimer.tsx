import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeUntil9AM = () => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(9, 0, 0, 0);

      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeUntil9AM());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeUntil9AM());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        key={value}
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 shadow-lg"
      >
        <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-white/70">
        {label}
      </span>
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 gradient-primary shadow-card">
      {/* subtle decorative ring */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm sm:text-base font-semibold text-white">
            Next update in
          </span>
        </div>

        {/* Time blocks */}
        <div className="flex items-start gap-2 sm:gap-3">
          <TimeBlock value={timeLeft.hours} label="hours" />
          <span className="text-3xl sm:text-4xl font-bold text-white/60 mt-3 leading-none select-none">:</span>
          <TimeBlock value={timeLeft.minutes} label="mins" />
          <span className="text-3xl sm:text-4xl font-bold text-white/60 mt-3 leading-none select-none">:</span>
          <TimeBlock value={timeLeft.seconds} label="secs" />
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
