'use client';

import { useRef, useState } from 'react';
import { Download, Upload, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMigration, type ComparisonResult } from '@/lib/migration';
import { ImportDialog } from './ImportDialog';

export function ProgressMigration() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [keepPreferences, setKeepPreferences] = useState(true);

  const { status, isLoading, handleExport, handlePreview, handleImport, resetStatus } =
    useMigration();

  /**
   * Handle export button click
   */
  const onExportClick = async () => {
    await handleExport();
  };

  /**
   * Handle import button click - open file picker
   */
  const onImportClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file selection
   */
  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Preview the import
    const previewResult = await handlePreview(file, keepPreferences);

    if (previewResult) {
      setComparison(previewResult);
      setShowImportDialog(true);
    }

    // Reset file input
    e.target.value = '';
  };

  /**
   * Handle confirmed import
   */
  const onConfirmImport = async () => {
    if (!selectedFile) return;

    setShowImportDialog(false);

    await handleImport(selectedFile, {
      keepPreferences,
      merge: true,
      createBackup: true,
    });
  };

  /**
   * Handle cancel import
   */
  const onCancelImport = () => {
    setShowImportDialog(false);
    setSelectedFile(null);
    setComparison(null);
    resetStatus();
  };

  /**
   * Get status message
   */
  const getStatusMessage = () => {
    switch (status.type) {
      case 'export_success':
        return {
          type: 'success' as const,
          message: 'Progress exported successfully!',
        };
      case 'export_error':
        return {
          type: 'error' as const,
          message: `Export failed: ${status.message}`,
        };
      case 'import_success':
        return {
          type: 'success' as const,
          message: 'Progress imported successfully! Reloading...',
        };
      case 'import_error':
        return {
          type: 'error' as const,
          message: `Import failed: ${status.message}`,
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="space-y-4">
      {/* Export */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--color-text)]">Export Progress</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Download your progress as a JSON file
          </p>
        </div>
        <Button
          onClick={onExportClick}
          variant="outline"
          disabled={isLoading && status.type === 'exporting'}
        >
          {isLoading && status.type === 'exporting' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </div>

      {/* Import */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-[var(--color-text)]">Import Progress</p>
          <p className="text-sm text-[var(--color-text-muted)]">
            Merge progress from another device
          </p>
        </div>
        <Button
          onClick={onImportClick}
          variant="outline"
          disabled={isLoading && (status.type === 'importing' || status.type === 'previewing')}
        >
          {isLoading && (status.type === 'importing' || status.type === 'previewing') ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {status.type === 'previewing' ? 'Loading...' : 'Importing...'}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </>
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />

      {/* Status message */}
      {statusMessage && (
        <Alert variant={statusMessage.type === 'error' ? 'destructive' : 'default'}>
          {statusMessage.type === 'success' ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{statusMessage.message}</AlertDescription>
        </Alert>
      )}

      {/* Import confirmation dialog */}
      {showImportDialog && comparison && (
        <ImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          comparison={comparison}
          keepPreferences={keepPreferences}
          onKeepPreferencesChange={setKeepPreferences}
          onConfirm={onConfirmImport}
          onCancel={onCancelImport}
        />
      )}
    </div>
  );
}
