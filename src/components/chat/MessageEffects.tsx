import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

export type MessageEffect = 'none' | 'confetti' | 'hearts' | 'fireworks' | 'sparkles' | 'slam' | 'gentle' | 'loud';

interface MessageEffectsProps {
  effect: MessageEffect;
  trigger: boolean;
  onComplete?: () => void;
  className?: string;
}

// Heart rain component
const HeartRain = ({ onComplete }: { onComplete?: () => void }) => {
  const hearts = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 1,
    size: 16 + Math.random() * 16,
  }));

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-red-500"
          style={{ left: heart.left, top: -50, fontSize: heart.size }}
          initial={{ y: -50, opacity: 1, rotate: 0 }}
          animate={{ 
            y: window.innerHeight + 100, 
            opacity: 0,
            rotate: [0, 15, -15, 10, -10, 0],
          }}
          transition={{ 
            duration: heart.duration, 
            delay: heart.delay,
            ease: 'easeIn',
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
};

// Sparkle burst component
const SparklesBurst = ({ onComplete }: { onComplete?: () => void }) => {
  const sparkles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * 360,
    distance: 50 + Math.random() * 150,
    delay: Math.random() * 0.2,
    size: 8 + Math.random() * 12,
  }));

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{ fontSize: sparkle.size }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1, 
            scale: 0,
          }}
          animate={{ 
            x: Math.cos((sparkle.angle * Math.PI) / 180) * sparkle.distance,
            y: Math.sin((sparkle.angle * Math.PI) / 180) * sparkle.distance,
            opacity: 0,
            scale: [0, 1.5, 0],
          }}
          transition={{ 
            duration: 1,
            delay: sparkle.delay,
            ease: 'easeOut',
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

// Screen shake for loud effect
const ScreenShake = ({ children, active }: { children: React.ReactNode; active: boolean }) => {
  return (
    <motion.div
      animate={active ? {
        x: [0, -5, 5, -5, 5, -3, 3, -2, 2, 0],
        y: [0, 2, -2, 2, -2, 1, -1, 1, -1, 0],
      } : {}}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
};

export const MessageEffects = ({ effect, trigger, onComplete, className }: MessageEffectsProps) => {
  const [showHearts, setShowHearts] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });

    setTimeout(() => onComplete?.(), 2500);
  }, [onComplete]);

  const fireFireworks = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  }, [onComplete]);

  useEffect(() => {
    if (!trigger) return;

    switch (effect) {
      case 'confetti':
        fireConfetti();
        break;
      case 'fireworks':
        fireFireworks();
        break;
      case 'hearts':
        setShowHearts(true);
        break;
      case 'sparkles':
        setShowSparkles(true);
        break;
      default:
        onComplete?.();
    }
  }, [trigger, effect, fireConfetti, fireFireworks, onComplete]);

  return (
    <>
      <AnimatePresence>
        {showHearts && (
          <HeartRain onComplete={() => {
            setShowHearts(false);
            onComplete?.();
          }} />
        )}
        {showSparkles && (
          <SparklesBurst onComplete={() => {
            setShowSparkles(false);
            onComplete?.();
          }} />
        )}
      </AnimatePresence>
    </>
  );
};

// Message bubble with effect
interface EffectBubbleProps {
  effect: MessageEffect;
  children: React.ReactNode;
  className?: string;
}

export const EffectBubble = ({ effect, children, className }: EffectBubbleProps) => {
  const getEffectStyles = (): { initial: any; animate: any; transition: any } => {
    switch (effect) {
      case 'slam':
        return {
          initial: { scale: 3, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: 'spring' as const, stiffness: 500, damping: 25 },
        };
      case 'gentle':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8 },
        };
      case 'loud':
        return {
          initial: { scale: 0.5 },
          animate: { 
            scale: [0.5, 1.1, 1],
            rotate: [0, -2, 2, -1, 1, 0],
          },
          transition: { duration: 0.4 },
        };
      default:
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.2 },
        };
    }
  };

  const effectProps = getEffectStyles();

  return (
    <motion.div
      className={className}
      initial={effectProps.initial}
      animate={effectProps.animate}
      transition={effectProps.transition}
    >
      {children}
    </motion.div>
  );
};

// Effect selector UI
interface EffectSelectorProps {
  selectedEffect: MessageEffect;
  onSelect: (effect: MessageEffect) => void;
  className?: string;
}

export const EffectSelector = ({ selectedEffect, onSelect, className }: EffectSelectorProps) => {
  const effects: { value: MessageEffect; icon: string; label: string }[] = [
    { value: 'none', icon: '💬', label: 'None' },
    { value: 'confetti', icon: '🎉', label: 'Confetti' },
    { value: 'hearts', icon: '❤️', label: 'Hearts' },
    { value: 'fireworks', icon: '🎆', label: 'Fireworks' },
    { value: 'sparkles', icon: '✨', label: 'Sparkles' },
    { value: 'slam', icon: '💥', label: 'Slam' },
    { value: 'gentle', icon: '🌸', label: 'Gentle' },
    { value: 'loud', icon: '📢', label: 'Loud' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        "flex flex-wrap gap-1 p-2 bg-popover rounded-lg border shadow-lg",
        className
      )}
    >
      {effects.map((effect) => (
        <motion.button
          key={effect.value}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(effect.value)}
          className={cn(
            "flex flex-col items-center p-2 rounded-md transition-colors min-w-[50px]",
            selectedEffect === effect.value 
              ? "bg-primary/20 ring-2 ring-primary" 
              : "hover:bg-muted"
          )}
        >
          <span className="text-xl">{effect.icon}</span>
          <span className="text-[10px] mt-0.5 text-muted-foreground">{effect.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export { ScreenShake };
