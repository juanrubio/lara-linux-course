'use client';

import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

interface FunFactProps {
  children: React.ReactNode;
}

export function FunFact({ children }: FunFactProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="my-4 p-4 rounded-lg bg-amber-900/20 border border-amber-700"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-amber-400">Fun Fact!</span>
          <div className="text-amber-200 mt-1">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}
