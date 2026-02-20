/* ============================================================
   History.tsx — Evidence log page
   ============================================================ */

import { useState, useCallback, useEffect } from 'react';
import type { EvidenceLogEntry } from '../core/schema';
import { loadHistory, deleteEntry, clearHistory, exportJSON, exportCSV, downloadBlob } from '../core/storage';
import HistoryTable from '../ui/HistoryTable';

export default function History() {
  const [entries, setEntries] = useState<EvidenceLogEntry[]>([]);

  const refresh = useCallback(() => {
    setEntries(loadHistory());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this entry?')) {
      deleteEntry(id);
      refresh();
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Delete ALL history? This cannot be undone.')) {
      clearHistory();
      refresh();
    }
  };

  const handleExportJSON = () => {
    const data = exportJSON(entries);
    downloadBlob(data, `ask-for-help-history-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleExportCSV = () => {
    const data = exportCSV(entries);
    downloadBlob(data, `ask-for-help-history-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="container page-enter">
      <h1 style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>
        📋 Evidence History
      </h1>
      <p className="text-muted text-sm mb-6">
        All your generated asks, stored locally on this device only.
        Export as JSON or CSV for assignment evidence.
      </p>

      <HistoryTable
        entries={entries}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        onExportJSON={handleExportJSON}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
}
