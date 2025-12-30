'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUp, AlertCircle } from 'lucide-react';
import type { ComparisonResult } from '@/lib/migration';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comparison: ComparisonResult;
  keepPreferences: boolean;
  onKeepPreferencesChange: (keep: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportDialog({
  open,
  onOpenChange,
  comparison,
  keepPreferences,
  onKeepPreferencesChange,
  onConfirm,
  onCancel,
}: ImportDialogProps) {
  const { current, imported, merged, conflicts } = comparison;

  // Calculate deltas
  const xpDelta = merged.xp - current.xp;
  const levelDelta = merged.level - current.level;
  const achievementsDelta = merged.achievements - current.achievements;
  const lessonsDelta = merged.lessonsCompleted - current.lessonsCompleted;

  const hasChanges =
    xpDelta !== 0 || levelDelta !== 0 || achievementsDelta !== 0 || lessonsDelta !== 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Progress</DialogTitle>
          <DialogDescription>
            Review the changes before importing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Comparison */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Progress */}
            <div className="border rounded-lg p-4 bg-[var(--color-surface)]">
              <h4 className="font-semibold mb-3 text-[var(--color-text)]">
                Current Progress
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Level:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {current.level}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">XP:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {current.xp}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Achievements:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {current.achievements}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Lessons:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {current.lessonsCompleted}
                  </span>
                </li>
              </ul>
            </div>

            {/* After Import */}
            <div className="border rounded-lg p-4 bg-[var(--color-surface)]">
              <h4 className="font-semibold mb-3 text-[var(--color-text)]">
                After Import
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Level:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {merged.level}
                    {levelDelta > 0 && (
                      <span className="text-green-500 ml-2 inline-flex items-center">
                        <ArrowUp className="h-3 w-3" />+{levelDelta}
                      </span>
                    )}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">XP:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {merged.xp}
                    {xpDelta > 0 && (
                      <span className="text-green-500 ml-2">+{xpDelta}</span>
                    )}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Achievements:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {merged.achievements}
                    {achievementsDelta > 0 && (
                      <span className="text-green-500 ml-2">+{achievementsDelta}</span>
                    )}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Lessons:</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {merged.lessonsCompleted}
                    {lessonsDelta > 0 && (
                      <span className="text-green-500 ml-2">+{lessonsDelta}</span>
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* No changes alert */}
          {!hasChanges && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No changes detected. Your progress is already up to date with this backup.
              </AlertDescription>
            </Alert>
          )}

          {/* Conflicts info */}
          {conflicts.length > 0 && (
            <Alert>
              <AlertDescription>
                <strong>Merge Strategy:</strong> Progress from both devices will be combined.
                Your XP, achievements, and completed lessons will accumulate.
              </AlertDescription>
            </Alert>
          )}

          {/* Preferences Choice */}
          <div className="space-y-3">
            <Label className="text-[var(--color-text)]">Settings & Preferences</Label>
            <RadioGroup
              value={keepPreferences ? 'keep' : 'import'}
              onValueChange={(value) => onKeepPreferencesChange(value === 'keep')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keep" id="keep" />
                <Label htmlFor="keep" className="font-normal cursor-pointer">
                  Keep current settings
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="import" id="import-prefs" />
                <Label htmlFor="import-prefs" className="font-normal cursor-pointer">
                  Use imported settings (theme, sounds, etc.)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Info box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              <strong className="text-[var(--color-text)]">Safe Import:</strong> Your current
              progress will be backed up automatically before importing. If something goes wrong,
              you can restore from the backup.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            {hasChanges ? 'Import & Merge' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
