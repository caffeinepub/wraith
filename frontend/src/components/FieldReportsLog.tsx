import React, { useState } from 'react';
import { FieldReport } from '../backend';
import { useAddFieldReport } from '../hooks/useQueries';
import { formatTimestamp } from '../lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Terminal } from 'lucide-react';

interface FieldReportsLogProps {
  codename: string;
  reports: FieldReport[];
}

export default function FieldReportsLog({ codename, reports }: FieldReportsLogProps) {
  const [content, setContent] = useState('');
  const addReport = useAddFieldReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await addReport.mutateAsync({ codename, content: content.trim() });
      setContent('');
    } catch (err) {
      // error shown below
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-ops-border/40 pb-2">
        <Terminal className="w-4 h-4 text-green-ops" />
        <span className="text-green-ops text-xs font-mono font-bold tracking-widest text-glow-green">
          FIELD REPORTS LOG — {reports.length} ENTRIES
        </span>
      </div>

      {/* Reports */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reports.length === 0 ? (
          <div className="text-ops-muted text-xs font-mono text-center py-4 border border-dashed border-ops-border/30">
            NO FIELD REPORTS ON FILE
          </div>
        ) : (
          [...reports].reverse().map((report, i) => (
            <div key={i} className="bg-ops-bg/60 border border-green-ops/20 p-3 font-mono">
              <div className="flex items-center justify-between mb-1">
                <span className="text-green-ops text-xs tracking-wider">
                  [{formatTimestamp(report.timestamp)}]
                </span>
                <span className="text-ops-muted text-xs">
                  {report.author.toString().slice(0, 12)}...
                </span>
              </div>
              <p className="text-foreground text-xs leading-relaxed whitespace-pre-wrap">{report.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Add report */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter field report content..."
          rows={3}
          className="ops-input bg-ops-bg border-ops-border/60 text-foreground font-mono text-xs rounded-none focus:border-green-ops/70 resize-none"
        />
        {addReport.isError && (
          <div className="text-red-ops text-xs font-mono">
            ERROR: {(addReport.error as Error)?.message}
          </div>
        )}
        <Button
          type="submit"
          disabled={addReport.isPending || !content.trim()}
          className="w-full bg-green-ops/10 border border-green-ops/40 text-green-ops hover:bg-green-ops/20 font-mono text-xs font-bold tracking-widest rounded-none"
        >
          {addReport.isPending ? (
            <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> TRANSMITTING...</>
          ) : (
            <><Send className="w-3 h-3 mr-2" /> SUBMIT FIELD REPORT</>
          )}
        </Button>
      </form>
    </div>
  );
}
