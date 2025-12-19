'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Lock,
  Sparkles,
  Flame,
  Target,
  Compass,
  Zap,
  Medal,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell, Navigation } from '@/components/layout';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS, type AchievementRarity, type AchievementCategory } from '@/lib/gamification';

const categoryIcons: Record<AchievementCategory, typeof Trophy> = {
  skill: Target,
  streak: Flame,
  exploration: Compass,
  challenge: Zap,
  secret: Star,
};

const rarityColors: Record<AchievementRarity, { bg: string; border: string; text: string }> = {
  common: {
    bg: 'bg-gray-800/50',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
  },
  uncommon: {
    bg: 'bg-green-900/50',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  rare: {
    bg: 'bg-blue-900/50',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  epic: {
    bg: 'bg-purple-900/50',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  legendary: {
    bg: 'bg-amber-900/50',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
};

export default function AchievementsPage() {
  const { unlockedAchievements } = useGameStore();
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Filter achievements
  const filteredAchievements = ACHIEVEMENTS.filter((achievement) => {
    const categoryMatch = selectedTab === 'all' || achievement.category === selectedTab;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  // Stats
  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const percentComplete = Math.round((totalUnlocked / totalAchievements) * 100);

  // Group by rarity for stats
  const byRarity = ACHIEVEMENTS.reduce((acc, a) => {
    if (!acc[a.rarity]) acc[a.rarity] = { total: 0, unlocked: 0 };
    acc[a.rarity].total++;
    if (unlockedAchievements.includes(a.id)) acc[a.rarity].unlocked++;
    return acc;
  }, {} as Record<string, { total: number; unlocked: number }>);

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Navigation breadcrumbs={[{ label: 'Achievements' }]} />
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-600">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Achievements</h1>
              <p className="text-[var(--color-text-muted)]">
                Collect badges and showcase your accomplishments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Progress Card */}
          <Card className="border-white/10 bg-[var(--color-surface)]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-[var(--color-primary)]/20">
                  <Medal className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    Collection Progress
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={percentComplete} className="h-3 flex-1" />
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {percentComplete}%
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {totalUnlocked} of {totalAchievements} achievements unlocked
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rarity Breakdown */}
          <Card className="border-white/10 bg-[var(--color-surface)]">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-3">
                By Rarity
              </h3>
              <div className="flex items-center gap-4">
                {(['common', 'uncommon', 'rare', 'epic', 'legendary'] as AchievementRarity[]).map(
                  (rarity) => (
                    <div key={rarity} className="text-center flex-1">
                      <div
                        className={`text-lg font-bold ${rarityColors[rarity].text}`}
                      >
                        {byRarity[rarity]?.unlocked || 0}/{byRarity[rarity]?.total || 0}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] capitalize">
                        {rarity}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-4">
          <Tabs defaultValue="all" onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="skill">Skill</TabsTrigger>
              <TabsTrigger value="streak">Streak</TabsTrigger>
              <TabsTrigger value="exploration">Exploration</TabsTrigger>
              <TabsTrigger value="challenge">Challenge</TabsTrigger>
              <TabsTrigger value="secret">Secret</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Rarity:</span>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              className="bg-[var(--color-surface)] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)]"
            >
              <option value="all">All</option>
              <option value="common">Common</option>
              <option value="uncommon">Uncommon</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement, index) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            const CategoryIcon = categoryIcons[achievement.category];
            const colors = rarityColors[achievement.rarity];

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className={`border transition-all ${
                    isUnlocked
                      ? `${colors.border} ${colors.bg}`
                      : 'border-white/5 bg-white/5 opacity-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                          isUnlocked
                            ? colors.bg + ' ' + colors.border + ' border-2'
                            : 'bg-gray-800/50'
                        }`}
                      >
                        {isUnlocked ? (
                          achievement.icon
                        ) : (
                          <Lock className="h-6 w-6 text-gray-500" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className={`font-bold ${
                              isUnlocked
                                ? 'text-[var(--color-text)]'
                                : 'text-gray-500'
                            }`}
                          >
                            {achievement.name}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize shrink-0 ${
                              isUnlocked ? colors.text : 'text-gray-500'
                            }`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>

                        <p
                          className={`text-sm mt-1 ${
                            isUnlocked
                              ? 'text-[var(--color-text-muted)]'
                              : 'text-gray-600'
                          }`}
                        >
                          {isUnlocked || achievement.category !== 'secret'
                            ? achievement.description
                            : '???'}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              isUnlocked ? colors.text : 'text-gray-500'
                            }`}
                          >
                            <CategoryIcon className="h-3 w-3" />
                            {achievement.category}
                          </span>
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              isUnlocked
                                ? 'text-[var(--color-accent)]'
                                : 'text-gray-500'
                            }`}
                          >
                            <Sparkles className="h-3 w-3" />
                            +{achievement.xpReward} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--color-text-muted)]">
              No achievements match your filters
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
