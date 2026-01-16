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
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card shadow-card rounded-lg px-3 py-2 min-w-[48px]"
      >
        <span className="font-display text-xl font-bold text-foreground">
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-muted/50">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Clock className="w-5 h-5" />
        <span className="text-sm font-medium">Next update in</span>
      </div>
      <div className="flex items-center gap-2">
        <TimeBlock value={timeLeft.hours} label="hrs" />
        <span className="text-xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.minutes} label="min" />
        <span className="text-xl font-bold text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.seconds} label="sec" />
      </div>
    </div>
  );
};

export default CountdownTimer;
