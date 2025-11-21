"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Complaint {
  id: string
  complaint_id: string
  title: string
  description: string
  status: string
  priority: string
  category_id: string
  created_at: string
}

export default function CitizenDashboard() {
  const supabase = getSupabaseClient()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  })

  useEffect(() => {
    fetchComplaints()
  }, [])

  async function fetchComplaints() {
    try {
      const { data } = await supabase.from("complaints").select("*").order("created_at", { ascending: false }).limit(10)

      if (data) {
        setComplaints(data as Complaint[])
        setStats({
          total: data.length,
          new: data.filter((c) => c.status === "new").length,
          inProgress: data.filter((c) => c.status === "in_progress").length,
          resolved: data.filter((c) => c.status === "resolved").length,
        })
      }
    } catch (error) {
      console.error("Error fetching complaints:", error)
    } finally {
      setLoading(false)
    }
  }

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case "new":
        return "badge-status new"
      case "in_progress":
        return "badge-status in-progress"
      case "resolved":
        return "badge-status resolved"
      case "closed":
        return "badge-status closed"
      default:
        return "badge-status new"
    }
  }

  function getPriorityBadgeClass(priority: string): string {
    return `badge-priority ${priority?.toLowerCase() || "low"}`
  }

  return (
    <div className="dashboard-main">
      <div className="dashboard-hero">
        <div className="hero-left">
          <h1 className="hero-title">Welcome back!</h1>
          <p className="hero-subtitle">Track and manage your complaints with Pokhara Municipal Services</p>
          <div className="hero-badges">
            <div className="hero-badge">
              <div className="hero-badge-dot"></div>
              <span>Active Complaints: {stats.inProgress}</span>
            </div>
            <div className="hero-badge">
              <div className="hero-badge-dot"></div>
              <span>Resolved: {stats.resolved}</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link href="/citizen/complaints/new" className="btn-primary">
              Submit New Complaint
            </Link>
            <Link href="/citizen/complaints" className="btn-secondary">
              View All
            </Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-metric-label">Total Complaints</div>
          <div className="hero-metric-main">{stats.total}</div>
          <div className="hero-metric-sub">All time complaints submitted</div>
          <div className="hero-progress">
            <div
              className="hero-progress-bar"
              style={{
                width: `${Math.min((stats.resolved / Math.max(stats.total, 1)) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <div className="hero-metric-sub" style={{ marginTop: "8px" }}>
            {stats.resolved} resolved
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Complaints</div>
            <div className="card-subtitle">Your latest submissions</div>
          </div>
          <Link href="/citizen/complaints" className="text-green-400 text-sm hover:text-green-300">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No complaints yet. Submit your first complaint to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="font-mono text-green-400">{complaint.complaint_id?.slice(0, 8)}...</td>
                    <td>
                      <Link href={`/citizen/complaints/${complaint.id}`} className="hover:text-green-400">
                        {complaint.title}
                      </Link>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(complaint.status)}>
                        <div className="badge-dot"></div>
                        {complaint.status?.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={getPriorityBadgeClass(complaint.priority)}>
                        {complaint.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="text-slate-400">{new Date(complaint.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
