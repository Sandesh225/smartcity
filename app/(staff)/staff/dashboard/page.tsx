// app/(staff)/staff/dashboard/page.tsx
import { requireSessionAndProfile } from '@/lib/auth/server-profile';

type ComplaintStatus = 'new' | 'in-progress' | 'resolved' | 'closed';

type Complaint = {
  id: number;
  title: string;
  category: string;
  status: ComplaintStatus;
  lastUpdate: string;
};

export default async function CitizenDashboardPage() {
  const { profile } = await requireSessionAndProfile('/citizen/dashboard');

  const fullName = profile.full_name ?? 'Citizen';

  // Dummy complaints data (replace with real DB later)
  const complaints: Complaint[] = [
    {
      id: 1,
      title: 'Pothole near Lakeside Chowk',
      category: 'Roads',
      status: 'in-progress',
      lastUpdate: '12 Nov 2025',
    },
    {
      id: 2,
      title: 'Garbage not collected in street',
      category: 'Waste',
      status: 'resolved',
      lastUpdate: '10 Nov 2025',
    },
    {
      id: 3,
      title: 'Streetlight not working in Ward 6',
      category: 'Streetlights',
      status: 'new',
      lastUpdate: '09 Nov 2025',
    },
    {
      id: 4,
      title: 'Water leakage near community hall',
      category: 'Water',
      status: 'resolved',
      lastUpdate: '05 Nov 2025',
    },
    {
      id: 5,
      title: 'Noise disturbance from construction',
      category: 'Other',
      status: 'closed',
      lastUpdate: '01 Nov 2025',
    },
  ];

  const totalComplaints = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'in-progress'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved')
    .length;
  const openCount = complaints.filter((c) =>
    ['new', 'in-progress'].includes(c.status)
  ).length;

  const resolvedRatio =
    totalComplaints > 0 ? (resolvedCount / totalComplaints) * 100 : 0;

  const firstName = fullName.split(' ')[0];

  return (
    <>
      {/* Top hero / welcome panel */}
      <section className="dashboard-hero">
        <div className="hero-left">
          <h1 className="hero-title">
            Welcome, {firstName}
          </h1>
          <p className="hero-subtitle">
            Citizen Portal – Smart City Pokhara. View and track your complaints,
            payments and ward services in one place.
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
            <a
              href="/citizen/complaints/new"
              className="btn-primary"
            >
              + Submit new complaint
            </a>
            <a
              href="/citizen/complaints"
              className="btn-secondary"
            >
              View my complaints
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div>
            <p className="hero-metric-label">Complaints overview</p>
            <p className="hero-metric-main">{totalComplaints}</p>
            <p className="hero-metric-sub">
              {openCount} active · {resolvedCount} resolved
            </p>
          </div>

          <div className="hero-progress" aria-hidden="true">
            <div
              className="hero-progress-bar"
              style={{ width: `${resolvedRatio}%` }}
            />
          </div>

          <p className="text-muted mt-1">
            This month&apos;s resolution rate based on your submitted complaints.
          </p>
        </div>
      </section>

      {/* Stats + recent complaints */}
      <section className="dashboard-grid">
        {/* Stats card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Your complaint summary</h2>
              <p className="card-subtitle">
                Quick snapshot of your complaints and their current status.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-label">Total complaints</p>
              <p className="stat-value">{totalComplaints}</p>
              <p className="stat-pill">All time</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Open (new + in progress)</p>
              <p className="stat-value">{openCount}</p>
              <p className="stat-pill">Awaiting resolution</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">In progress</p>
              <p className="stat-value">{inProgressCount}</p>
              <p className="stat-pill">Being worked on</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Resolved</p>
              <p className="stat-value">{resolvedCount}</p>
              <p className="stat-pill">Successfully closed</p>
            </div>
          </div>

          <div className="quick-actions">
            <p className="text-muted">
              Next steps
            </p>
            <div className="quick-actions-row">
              <a
                href="/citizen/complaints/new"
                className="chip"
              >
                + Submit new complaint
              </a>
              <a
                href="/citizen/complaints"
                className="chip"
              >
                View all my complaints
              </a>
              <a
                href="/citizen/payments"
                className="chip"
              >
                View my payments
              </a>
            </div>
          </div>
        </div>

        {/* Recent complaints table card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent complaints</h2>
              <p className="card-subtitle">
                Your most recent submissions with current status and last update.
              </p>
            </div>
            <a
              href="/citizen/complaints"
              className="text-[11px] text-emerald-400 hover:text-emerald-300"
            >
              View all →
            </a>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Last update</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint, index) => (
                  <tr key={complaint.id}>
                    <td>{index + 1}</td>
                    <td>{complaint.title}</td>
                    <td>{complaint.category}</td>
                    <td>
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td>{complaint.lastUpdate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  const labelMap: Record<ComplaintStatus, string> = {
    new: 'New',
    'in-progress': 'In progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return (
    <span className={`badge-status ${status}`}>
      <span className="badge-dot" />
      <span>{labelMap[status]}</span>
    </span>
  );
}
