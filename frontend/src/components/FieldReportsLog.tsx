import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Send } from 'lucide-react';
import type { Mission, FieldReport } from '../backend';
import { useAddFieldReport } from '../hooks/useQueries';

interface FieldReportsLogProps {
  mission: Mission;
}

export default function FieldReportsLog({ mission }: FieldReportsLogProps) {
  const [reportContent, setReportContent] = useState('');
  const addReportMutation = useAddFieldReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportContent.trim()) return;
    try {
      await addReportMutation.mutateAsync({
        codename: mission.codename,
        reportContent: reportContent.trim(),
      });
      setReportContent('');
    } catch (err) {
      console.error('Field report error:', err);
    }
  };

  const formatTimestamp = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleString();
  };

  const sortedReports = [...mission.fieldReports].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div className="space-y-4">
      {/* Submit new report */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">
          Submit Field Report
        </Label>
        <Textarea
          value={reportContent}
          onChange={(e) => setReportContent(e.target.value)}
          disabled={addReportMutation.isPending}
          placeholder="Enter field report content..."
          className="bg-ops-surface border-ops-border text-ops-text"
          rows={3}
        />
        <Button
          type="submit"
          disabled={addReportMutation.isPending || !reportContent.trim()}
          size="sm"
          className="bg-ops-accent text-ops-bg hover:bg-ops-accent/90"
        >
          {addReportMutation.isPending ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="w-3 h-3 mr-1" /> Submit Report
            </>
          )}
        </Button>
      </form>

      {/* Reports list */}
      <div className="space-y-2">
        <Label className="text-ops-muted text-xs uppercase tracking-widest">
          Reports ({mission.fieldReports.length})
        </Label>
        {sortedReports.length === 0 ? (
          <p className="text-ops-muted text-sm">No field reports submitted yet.</p>
        ) : (
          sortedReports.map((report: FieldReport, idx: number) => (
            <div
              key={idx}
              className="bg-ops-surface border border-ops-border rounded p-3 space-y-1"
            >
              <div className="flex items-center justify-between text-xs text-ops-muted">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {report.author.toString()}
                </span>
                <span>{formatTimestamp(report.timestamp)}</span>
              </div>
              <p className="text-ops-text text-sm whitespace-pre-wrap">{report.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
