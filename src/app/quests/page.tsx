'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scroll,
  Target,
  Clock,
  Star,
  Lock,
  CheckCircle2,
  ChevronRight,
  Swords,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell, Navigation } from '@/components/layout';
import { useGameStore } from '@/store/gameStore';
import { QUESTS, type QuestStatus } from '@/lib/gamification';
import { NPC_CHARACTERS, type NPCCharacter } from '@/types';

const statusOrder: QuestStatus[] = ['in_progress', 'available', 'locked', 'completed'];

// Helper to get NPC by character ID
function getNpc(characterId: string): NPCCharacter {
  return NPC_CHARACTERS.find(npc => npc.id === characterId) || NPC_CHARACTERS[0];
}

export default function QuestsPage() {
  const { currentLevel } = useGameStore();
  const [selectedTab, setSelectedTab] = useState('all');

  // Organize quests by status
  const questsByStatus = QUESTS.reduce((acc, quest) => {
    // Determine quest status based on level requirements
    let status: QuestStatus;
    if (quest.id === 'ch1_terminal_awakening') {
      status = 'in_progress';
    } else if (quest.requiredLevel <= currentLevel) {
      status = 'available';
    } else {
      status = 'locked';
    }

    if (!acc[status]) acc[status] = [];
    acc[status].push({ ...quest, status });
    return acc;
  }, {} as Record<QuestStatus, (typeof QUESTS[number] & { status: QuestStatus })[]>);

  const filteredQuests =
    selectedTab === 'all'
      ? [...(questsByStatus.in_progress || []), ...(questsByStatus.available || []), ...(questsByStatus.locked || []), ...(questsByStatus.completed || [])]
      : questsByStatus[selectedTab as QuestStatus] || [];

  const activeCount = questsByStatus.in_progress?.length || 0;
  const availableCount = questsByStatus.available?.length || 0;
  const completedCount = questsByStatus.completed?.length || 0;

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <Navigation breadcrumbs={[{ label: 'Quests' }]} />
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-600">
              <Scroll className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Quest Board</h1>
              <p className="text-[var(--color-text-muted)]">
                Complete quests to earn XP and unlock achievements
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{activeCount}</div>
              <div className="text-xs text-[var(--color-text-muted)]">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{availableCount}</div>
              <div className="text-xs text-[var(--color-text-muted)]">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{completedCount}</div>
              <div className="text-xs text-[var(--color-text-muted)]">Completed</div>
            </div>
          </div>
        </motion.div>

        {/* Featured Quest */}
        {questsByStatus.in_progress?.[0] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-amber-500/50 bg-gradient-to-br from-amber-900/30 to-orange-900/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{getNpc(questsByStatus.in_progress[0].character).name[0]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-amber-500 text-black">
                        <Swords className="h-3 w-3 mr-1" />
                        Active Quest
                      </Badge>
                      <Badge variant="outline" className="border-amber-500/50">
                        Chapter {questsByStatus.in_progress[0].chapter}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                      {questsByStatus.in_progress[0].title}
                    </h2>
                    <p className="text-[var(--color-text-muted)] mb-4">
                      {questsByStatus.in_progress[0].description}
                    </p>

                    {/* Quest Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-[var(--color-text-muted)]">Progress</span>
                        <span className="text-amber-400">
                          0/{questsByStatus.in_progress[0].steps.length} steps
                        </span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          +{questsByStatus.in_progress[0].rewards.xp} XP
                        </span>
                      </div>
                      {questsByStatus.in_progress[0].rewards.badge && (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-medium text-[var(--color-text)]">
                            Badge: {questsByStatus.in_progress[0].rewards.badge.replace(/-|_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link href={`/quests/${questsByStatus.in_progress[0].id}`}>
                        <Button className="bg-amber-600 hover:bg-amber-700">
                          Continue Quest
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quest Tabs */}
        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Quests</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <QuestCard
                    quest={quest}
                    status={quest.status}
                    currentLevel={currentLevel}
                  />
                </motion.div>
              ))}

              {filteredQuests.length === 0 && (
                <div className="col-span-2 text-center py-12 text-[var(--color-text-muted)]">
                  No quests found in this category
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

interface QuestCardProps {
  quest: typeof QUESTS[number] & { status: QuestStatus };
  status: QuestStatus;
  currentLevel: number;
}

function QuestCard({ quest, status, currentLevel }: QuestCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isActive = status === 'in_progress';

  return (
    <Card
      className={`border transition-all ${
        isLocked
          ? 'border-white/5 bg-white/5 opacity-60'
          : isCompleted
          ? 'border-green-700/50 bg-green-900/20'
          : isActive
          ? 'border-amber-500/50 bg-amber-900/20'
          : 'border-white/10 bg-[var(--color-surface)] hover:border-amber-500/50'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getNpc(quest.character).name[0]}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[var(--color-text)]">{quest.title}</h3>
                {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                {isLocked && <Lock className="h-4 w-4 text-gray-500" />}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Chapter {quest.chapter} • {quest.steps.length} steps
              </p>
            </div>
          </div>
          <Badge
            variant={isLocked ? 'secondary' : isCompleted ? 'default' : 'outline'}
            className={
              isActive
                ? 'bg-amber-500 text-black'
                : isCompleted
                ? 'bg-green-600'
                : ''
            }
          >
            {isActive ? 'Active' : isCompleted ? 'Done' : isLocked ? 'Locked' : 'Available'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
          {quest.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4" />
              {quest.rewards.xp} XP
            </span>
            <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
              <Target className="h-4 w-4" />
              Lvl {quest.requiredLevel}+
            </span>
          </div>

          {!isLocked && (
            <Link href={`/quests/${quest.id}`}>
              <Button size="sm" variant={isCompleted ? 'outline' : 'default'}>
                {isCompleted ? 'Review' : isActive ? 'Continue' : 'Start'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}

          {isLocked && (
            <span className="text-xs text-[var(--color-text-muted)]">
              Reach level {quest.requiredLevel} to unlock
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
