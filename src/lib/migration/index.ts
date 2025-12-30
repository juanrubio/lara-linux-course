import { useState, useCallback } from 'react';
import { exportAndDownload } from './export';
import { importProgress, previewImport } from './import';
import type { ImportResult, ComparisonResult, ImportOptions } from './types';

// Re-export types
export type { BackupData, ImportResult, ComparisonResult, ImportOptions } from './types';

// Re-export functions
export { exportAndDownload, importProgress, previewImport };

/**
 * Migration status
 */
export type MigrationStatus =
  | { type: 'idle' }
  | { type: 'exporting' }
  | { type: 'export_success' }
  | { type: 'export_error'; message: string }
  | { type: 'importing' }
  | { type: 'import_success'; changes?: any }
  | { type: 'import_error'; message: string }
  | { type: 'previewing' }
  | { type: 'preview_ready'; comparison: ComparisonResult };

/**
 * React hook for migration functionality
 */
export function useMigration() {
  const [status, setStatus] = useState<MigrationStatus>({ type: 'idle' });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Export progress
   */
  const handleExport = useCallback(async () => {
    setIsLoading(true);
    setStatus({ type: 'exporting' });

    try {
      await exportAndDownload();
      setStatus({ type: 'export_success' });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setStatus({ type: 'idle' });
      }, 3000);
    } catch (error: any) {
      console.error('[Migration] Export error:', error);
      setStatus({
        type: 'export_error',
        message: error.message || 'Failed to export progress',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Preview import (for showing comparison dialog)
   */
  const handlePreview = useCallback(async (file: File, keepPreferences: boolean = false) => {
    setIsLoading(true);
    setStatus({ type: 'previewing' });

    try {
      const result = await previewImport(file, keepPreferences);

      if (result.success && result.comparison) {
        setStatus({
          type: 'preview_ready',
          comparison: result.comparison,
        });
        return result.comparison;
      } else {
        const errorMessage = result.error?.message || 'Failed to preview import';
        setStatus({
          type: 'import_error',
          message: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      console.error('[Migration] Preview error:', error);
      setStatus({
        type: 'import_error',
        message: error.message || 'Failed to preview import',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Import progress
   */
  const handleImport = useCallback(async (file: File, options?: ImportOptions) => {
    setIsLoading(true);
    setStatus({ type: 'importing' });

    try {
      const result: ImportResult = await importProgress(file, options);

      if (result.success) {
        setStatus({
          type: 'import_success',
          changes: result.changes,
        });
        return result;
      } else {
        setStatus({
          type: 'import_error',
          message: result.error?.message || 'Import failed',
        });
        return result;
      }
    } catch (error: any) {
      console.error('[Migration] Import error:', error);
      setStatus({
        type: 'import_error',
        message: error.message || 'Import failed',
      });
      return {
        success: false,
        error: {
          code: 'IMPORT_FAILED' as any,
          message: error.message || 'Import failed',
        },
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset status
   */
  const resetStatus = useCallback(() => {
    setStatus({ type: 'idle' });
  }, []);

  return {
    status,
    isLoading,
    handleExport,
    handlePreview,
    handleImport,
    resetStatus,
  };
}
