'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Palette,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Bell,
  BellOff,
  Monitor,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AppShell, Navigation } from '@/components/layout';
import { useGameStore } from '@/store/gameStore';

const THEMES = [
  {
    id: 'space',
    name: 'Space Station',
    description: 'Deep space vibes with cosmic colors',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
    unlockLevel: 1,
  },
  {
    id: 'forest',
    name: 'Forest Explorer',
    description: 'Calming greens and earthy tones',
    colors: ['#1a2f1a', '#2d4a2d', '#4a6741', '#8fbc8f'],
    unlockLevel: 3,
  },
  {
    id: 'ocean',
    name: 'Ocean Depths',
    description: 'Serene blues and aquatic hues',
    colors: ['#0a1628', '#1a3a5c', '#2e6b8a', '#7fcdcd'],
    unlockLevel: 5,
  },
  {
    id: 'desert',
    name: 'Desert Sunset',
    description: 'Warm oranges and sandy tones',
    colors: ['#2d1810', '#5c3a21', '#c2703a', '#f4a460'],
    unlockLevel: 8,
  },
];

export default function SettingsPage() {
  const { currentLevel, preferences, updatePreferences, resetProgress } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleThemeChange = (themeId: string) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme && theme.unlockLevel <= currentLevel) {
      updatePreferences({ theme: themeId as 'space' | 'forest' | 'ocean' | 'desert' });
      showSaveMessage();
    }
  };

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
    showSaveMessage();
  };

  const showSaveMessage = () => {
    setSaveMessage('Settings saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleResetProgress = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <Navigation breadcrumbs={[{ label: 'Settings' }]} />
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gray-600">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">Settings</h1>
              <p className="text-[var(--color-text-muted)]">
                Customize your learning experience
              </p>
            </div>
          </div>

          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-400"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>{saveMessage}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Theme Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-[var(--color-surface)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle>Theme</CardTitle>
              </div>
              <CardDescription>
                Choose your visual theme. Unlock more themes as you level up!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((theme) => {
                  const isUnlocked = theme.unlockLevel <= currentLevel;
                  const isSelected = preferences.theme === theme.id;

                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      disabled={!isUnlocked}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                          : isUnlocked
                          ? 'border-white/10 hover:border-white/30'
                          : 'border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {/* Color preview */}
                      <div className="flex gap-1 mb-3">
                        {theme.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      <h3 className="font-semibold text-[var(--color-text)]">
                        {theme.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {theme.description}
                      </p>

                      {/* Status badges */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                      )}
                      {!isUnlocked && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-500">
                          <Lock className="h-4 w-4" />
                          Level {theme.unlockLevel}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sound & Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-white/10 bg-[var(--color-surface)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle>Sound & Notifications</CardTitle>
              </div>
              <CardDescription>
                Control audio feedback and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.soundEnabled ? (
                    <Volume2 className="h-5 w-5 text-[var(--color-text-muted)]" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-[var(--color-text-muted)]" />
                  )}
                  <div>
                    <Label className="text-[var(--color-text)]">Sound Effects</Label>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Play sounds for achievements and level ups
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => handleToggle('soundEnabled', checked)}
                />
              </div>

              {/* Achievement Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.notificationsEnabled ? (
                    <Bell className="h-5 w-5 text-[var(--color-text-muted)]" />
                  ) : (
                    <BellOff className="h-5 w-5 text-[var(--color-text-muted)]" />
                  )}
                  <div>
                    <Label className="text-[var(--color-text)]">
                      Achievement Popups
                    </Label>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Show popups when you earn achievements
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.notificationsEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle('notificationsEnabled', checked)
                  }
                />
              </div>

              {/* Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[var(--color-text-muted)]" />
                  <div>
                    <Label className="text-[var(--color-text)]">Animations</Label>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Enable celebration animations and effects
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.animationsEnabled}
                  onCheckedChange={(checked) =>
                    handleToggle('animationsEnabled', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-white/10 bg-[var(--color-surface)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle>Display</CardTitle>
              </div>
              <CardDescription>Adjust display preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {preferences.darkMode ? (
                    <Moon className="h-5 w-5 text-[var(--color-text-muted)]" />
                  ) : (
                    <Sun className="h-5 w-5 text-[var(--color-text-muted)]" />
                  )}
                  <div>
                    <Label className="text-[var(--color-text)]">Dark Mode</Label>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      Toggle between dark and light themes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => handleToggle('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-red-900/50 bg-red-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-400" />
                <CardTitle className="text-red-400">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions that affect your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showResetConfirm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text)]">
                      Reset All Progress
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      This will erase all your XP, achievements, and lesson progress
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => setShowResetConfirm(true)}
                  >
                    Reset Progress
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-red-900/30 border border-red-700">
                  <p className="font-bold text-red-400 mb-2">Are you sure?</p>
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    This action cannot be undone. All your progress, achievements,
                    and stats will be permanently deleted.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleResetProgress}>
                      Yes, Reset Everything
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppShell>
  );
}
