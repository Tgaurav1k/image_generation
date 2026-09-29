import { useEffect, useState } from 'react';
import { Images, Database, Users, Activity, Clock, Loader2 } from 'lucide-react';
import { getDashboard } from '../services/adminService';
import { formatBytes, timeAgo } from '../utils/formatters';
import PageTransition from '../components/common/PageTransition';
import useAuthStore from '../store/authStore';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Icon size={18} style={{ color: 'var(--accent-sage)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 300, color: 'var(--text-muted)',
      }}>
        <div style={{
          width: 32, height: 32, border: '3px solid var(--border-subtle)',
          borderTopColor: 'var(--accent-sage)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  if (!data) return <p style={{ color: 'var(--text-muted)' }}>Failed to load dashboard</p>;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <PageTransition>
      <div className="bento-grid">
        {/* Greeting Header — full width */}
        <div className="bento-full bento-tile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {getGreeting()}, {user?.username || 'Admin'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{today}</p>
          </div>
        </div>

        {/* Stat cards — 4 x 3-col */}
        <div className="bento-3 bento-tile stat-card">
          <StatCard icon={Images} label="Total Images" value={data.total_images?.toLocaleString() || '0'} />
        </div>
        <div className="bento-3 bento-tile stat-card">
          <StatCard icon={Database} label="Storage Used" value={formatBytes(data.total_storage_bytes || 0)} />
        </div>
        <div className="bento-3 bento-tile stat-card">
          <StatCard icon={Users} label="Users" value={data.users?.length || 0} />
        </div>
        <div className="bento-3 bento-tile stat-card">
          <StatCard icon={Clock} label="Last Cleanup" value={data.last_cleanup ? timeAgo(data.last_cleanup) : 'N/A'} />
        </div>

        {/* Per-user table — 8 cols */}
        <div className="bento-8 bento-tile">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Per-User Stats</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={thStyle}>Username</th>
                  <th style={thStyle}>Images</th>
                  <th style={thStyle}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {data.users?.map(u => (
                  <tr key={u.username} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>{u.username}</td>
                    <td style={tdStyle}>{u.image_count}</td>
                    <td style={tdStyle}>{u.last_active ? timeAgo(u.last_active) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity log — 8 cols, Quick Actions — 4 cols */}
        <div className="bento-8 bento-tile">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={16} /> Recent Activity
          </h2>
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Action</th>
                  <th style={thStyle}>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_activity?.map((a, i) => (
                  <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={tdStyle}>{a.username || 'system'}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        background: 'var(--accent-blue-dim)', color: 'var(--accent-blue)',
                        fontSize: 12, fontWeight: 500,
                      }}>
                        {a.action}
                      </span>
                    </td>
                    <td style={tdStyle}>{timeAgo(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bento-4 bento-tile">
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Retention:</span> 7 days
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Cleanup:</span> Daily at midnight
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Max bulk:</span> 50 images
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

const thStyle = { textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12, whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px', color: 'var(--text-secondary)' };
