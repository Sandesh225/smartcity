

// FILE: app/(citizen)/citizen/dashboard/page.tsx
import { requireSessionAndProfile } from '@/lib/auth/server-profile';
import Link from 'next/link';
import { FileText, Bell, TrendingUp, Clock } from 'lucide-react';

export default async function CitizenDashboardPage() {
  const { profile, supabase } = await requireSessionAndProfile('/citizen/dashboard');

  const fullName = profile.full_name ?? 'Citizen';
  const firstName = fullName.split(' ')[0];

  // Fetch user's complaint stats
  const { data: complaints } = await supabase
    .from('complaints')
    .select('id, tracking_id, title, status, priority, created_at, category_id')
    .eq('citizen_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const totalComplaints = complaints?.length || 0;
  const openCount = complaints?.filter(c => ['new', 'in_progress'].includes(c.status)).length || 0;
  const inProgressCount = complaints?.filter(c => c.status === 'in_progress').length || 0;
  const resolvedCount = complaints?.filter(c => c.status === 'resolved').length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <section className="dashboard-hero">
        <div className="hero-left">
          <h1 className="hero-title">Welcome back, {firstName}! 👋</h1>
          <p className="hero-subtitle">
            Your citizen portal for Smart City Pokhara. Submit complaints, track issues, and stay updated.
          </p>

          <div className="hero-badges">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>Total complaints: {totalComplaints}</span>
            </div>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>Open: {openCount}</span>
            </div>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>Resolved: {resolvedCount}</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link href="/citizen/complaints/new" className="btn-primary">
              <FileText className="w-4 h-4" />
              Submit New Complaint
            </Link>
            <Link href="/citizen/complaints" className="btn-secondary">
              View All Complaints
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div>
            <p className="hero-metric-label">This Month</p>
            <p className="hero-metric-main">{totalComplaints}</p>
            <p className="hero-metric-sub">
              {openCount} active · {resolvedCount} resolved
            </p>
          </div>

          <div className="hero-progress">
            <div
              className="hero-progress-bar"
              style={{ width: `${totalComplaints > 0 ? (resolvedCount / totalComplaints) * 100 : 0}%` }}
            />
          </div>

          <p className="text-muted mt-1">
            Resolution rate based on your submitted complaints
          </p>
        </div>
      </section>

      {/* Stats + Recent Complaints */}
      <section className="dashboard-grid">
        {/* Stats Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Complaint Summary</h2>
              <p className="card-subtitle">Overview of your submissions</p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total</p>
              <p className="stat-value">{totalComplaints}</p>
              <p className="stat-pill">All time</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Open</p>
              <p className="stat-value">{openCount}</p>
              <p className="stat-pill">Active</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">In Progress</p>
              <p className="stat-value">{inProgressCount}</p>
              <p className="stat-pill">Working</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Resolved</p>
              <p className="stat-value">{resolvedCount}</p>
              <p className="stat-pill">Closed</p>
            </div>
          </div>

          <div className="quick-actions">
            <p className="text-muted">Quick actions</p>
            <div className="quick-actions-row">
              <Link href="/citizen/complaints/new" className="chip">
                + New Complaint
              </Link>
              <Link href="/citizen/complaints" className="chip">
                View All
              </Link>
              <Link href="/citizen/notifications" className="chip">
                <Bell className="w-3 h-3 inline mr-1" />
                Notifications
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <RecentComplaintsCard complaints={complaints || []} />
      </section>
    </div>
  );
}

function RecentComplaintsCard({ complaints }: { complaints: any[] }) {
  if (complaints.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Complaints</h2>
            <p className="card-subtitle">Your latest submissions</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mb-4" />
          <p className="text-sm text-slate-400 mb-4">No complaints yet</p>
          <Link href="/citizen/complaints/new" className="btn-primary text-xs">
            Submit First Complaint
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Recent Complaints</h2>
          <p className="card-subtitle">Your latest submissions</p>
        </div>
        <Link href="/citizen/complaints" className="text-xs text-emerald-400 hover:text-emerald-300">
          View all →
        </Link>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id}>
                <td className="font-mono text-xs">{c.tracking_id}</td>
                <td>
                  <Link
                    href={`/citizen/complaints/${c.id}`}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                  >
                    {c.title}
                  </Link>
                </td>
                <td>
                  <StatusBadge status={c.status} />
                </td>
                <td className="text-xs text-slate-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    new: { label: 'New', className: 'badge-status new' },
    in_progress: { label: 'In Progress', className: 'badge-status in-progress' },
    resolved: { label: 'Resolved', className: 'badge-status resolved' },
    closed: { label: 'Closed', className: 'badge-status closed' },
  };

  const { label, className } = config[status] || config.new;

  return (
    <span className={className}>
      <span className="badge-dot" />
      <span>{label}</span>
    </span>
  );
}