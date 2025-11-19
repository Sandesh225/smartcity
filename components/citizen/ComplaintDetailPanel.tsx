'use client';

import { useEffect, useState } from 'react';
import { useComplaintSummary } from '@/hooks/useComplaintSummary';
import { supabaseBrowser } from '@/lib/supabaseClient';

type Props = {
  complaintId: string | null;
  language: 'en' | 'np';
};

type AttachmentRow = {
  id: string;
  file_name: string;
  storage_path: string;
};

function statusLabel(status: string, language: 'en' | 'np') {
  const labels: Record<string, Record<'en' | 'np', string>> = {
    new: { en: 'New', np: 'नयाँ' },
    in_progress: { en: 'In Progress', np: 'प्रक्रियामा' },
    resolved: { en: 'Resolved', np: 'समाधान भएको' },
    closed: { en: 'Closed', np: 'बन्द' },
  };
  return labels[status]?.[language] || status;
}

export function ComplaintDetailPanel({ complaintId, language }: Props) {
  const { summary, loading, errorText, load } = useComplaintSummary();
  const [attachments, setAttachments] = useState<
    { id: string; file_name: string; url: string }[]
  >([]);
  const [activeTab, setActiveTab] =
    useState<'summary' | 'timeline' | 'logs'>('summary');

  useEffect(() => {
    if (!complaintId) return;

    load(complaintId);

    (async () => {
      const { data, error } = await supabaseBrowser
        .from('complaint_attachments')
        .select('id, file_name, storage_path')
        .eq('complaint_id', complaintId);

      if (error || !data) {
        setAttachments([]);
        return;
      }

      const signed: { id: string; file_name: string; url: string }[] = [];

      for (const row of data as AttachmentRow[]) {
        const { data: s, error: se } = await supabaseBrowser.storage
          .from('complaint-files')
          .createSignedUrl(row.storage_path, 3600);
        if (se || !s) continue;
        signed.push({ id: row.id, file_name: row.file_name, url: s.signedUrl });
      }

      setAttachments(signed);
    })();
  }, [complaintId, load]);

  if (!complaintId) {
    return (
      <div className="card complaints-card">
        <div className="empty-state">
          <div className="empty-state-icon">👉</div>
          <p className="empty-state-title">
            {language === 'en'
              ? 'Select a complaint to view details'
              : 'विवरण हेर्न गुनासो छान्नुहोस्'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card complaints-card">
        <div className="space-y-4">
          <div className="skeleton h-10 rounded-lg" />
          <div className="skeleton h-20 rounded-lg" />
          <div className="skeleton h-20 rounded-lg" />
        </div>
      </div>
    );
  }

  if (errorText || !summary) {
    return (
      <div className="card complaints-card">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-title text-destructive">{errorText}</p>
        </div>
      </div>
    );
  }

  const { complaint, category, ward, status_history, work_logs } = summary;

  return (
    <div className="card complaints-card">
      {/* Header */}
      <div className="detail-header">
        <div>
          <h3 className="detail-title">{complaint.title}</h3>
          <p className="detail-tracking">
            {language === 'en' ? 'Tracking ID' : 'ट्र्याकिङ आईडी'}:{' '}
            <strong>{complaint.tracking_id}</strong>
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="detail-status-bar">
        <div
          className={`status-badge status-${complaint.status.replace('_', '-')}`}
        >
          {statusLabel(complaint.status, language)}
        </div>

        {complaint.is_overdue && (
          <div className="status-badge status-overdue">
            {language === 'en' ? 'Overdue' : 'समयबाहिर'}
          </div>
        )}

        {complaint.sla_due_date && !complaint.is_overdue && (
          <div className="status-badge status-due">
            {new Date(complaint.sla_due_date).toLocaleDateString()}
          </div>
        )}

        <div className={`priority-badge priority-${complaint.priority}`}>
          {complaint.priority.toUpperCase()}
        </div>
      </div>

      {/* Meta row */}
      <div className="detail-meta-row">
        <div className="meta-item">
          <div className="meta-label">
            {language === 'en' ? 'Category' : 'श्रेणी'}
          </div>
          <div className="meta-value">
            {language === 'en'
              ? category.category_name
              : category.category_name_nepali || category.category_name}
          </div>
        </div>

        <div className="meta-item">
          <div className="meta-label">
            {language === 'en' ? 'Ward' : 'वार्ड'}
          </div>
          <div className="meta-value">
            {`Ward ${ward.ward_number} – ${
              language === 'en'
                ? ward.ward_name
                : ward.ward_name_nepali || ward.ward_name
            }`}
          </div>
        </div>

        <div className="meta-item">
          <div className="meta-label">
            {language === 'en' ? 'Created' : 'बनाइएको'}
          </div>
          <div className="meta-value">
            {new Date(complaint.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-selector">
        <button
          className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          {language === 'en' ? 'Summary' : 'सारांश'}
        </button>
        <button
          className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          {language === 'en' ? 'Timeline' : 'समयरेखा'}
        </button>
        <button
          className={`tab-button ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          {language === 'en' ? 'Updates' : 'अपडेटहरू'}
        </button>
      </div>

      {/* Tab contents */}
      <div className="detail-content">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">
                {language === 'en' ? 'Description' : 'विवरण'}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {complaint.description}
              </p>
            </div>

            {attachments.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  {language === 'en' ? 'Attachments' : 'संलग्नकहरू'}
                </h4>
                <div className="attachments-grid">
                  {attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="attachment-link"
                    >
                      📎 {a.file_name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div>
            {status_history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {language === 'en'
                  ? 'No status updates yet'
                  : 'अभी कुनै स्थिति अपडेट नै छैन'}
              </p>
            ) : (
              <div className="timeline">
                {status_history.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-content">
                      <div className="timeline-title">
                        {h.from_status
                          ? statusLabel(h.from_status, language)
                          : 'Created'}{' '}
                        → {statusLabel(h.to_status, language)}
                      </div>
                      <div className="timeline-time">
                        {new Date(h.changed_at).toLocaleString()}
                      </div>
                      {h.notes && (
                        <div className="timeline-description">{h.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            {work_logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {language === 'en'
                  ? 'No updates available'
                  : 'कुनै अपडेट उपलब्ध छैन'}
              </p>
            ) : (
              <div className="space-y-3">
                {work_logs.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-lg bg-muted/50 border border-border/60"
                  >
                    <p className="text-sm">{w.log_content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(w.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
