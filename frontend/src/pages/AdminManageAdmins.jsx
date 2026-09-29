import { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Loader2, Trash2 } from 'lucide-react';
import { listAdmins, createAdmin, deleteAdmin } from '../services/adminService';
import { formatDate } from '../utils/formatters';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import PageTransition from '../components/common/PageTransition';

export default function AdminManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    listAdmins()
      .then(data => setAdmins(data.admins || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await createAdmin(username, password);
      setModalOpen(false);
      setUsername('');
      setPassword('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin');
    }
    setCreating(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdmin(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete admin');
    }
    setDeleting(false);
  };

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

  return (
    <PageTransition>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={28} style={{ color: 'var(--accent-sage)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Manage Admins</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus size={16} /> Create Admin
        </Button>
      </div>

      <div className="bento-tile">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Users Created</th>
                <th style={thStyle}>Total Images</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                    No admins created yet
                  </td>
                </tr>
              )}
              {admins.map(a => (
                <tr key={a.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 'var(--radius-full)',
                        background: 'var(--accent-sage-dim)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                      }}>
                        {a.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      {a.username}
                    </div>
                  </td>
                  <td style={tdStyle}>{a.user_count}</td>
                  <td style={tdStyle}>{a.total_images}</td>
                  <td style={tdStyle}>{formatDate(a.created_at)}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', padding: 6, borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center',
                        transition: 'color var(--duration-fast) var(--ease-out)',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--status-error)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      title="Delete admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setError(''); }} title="Create New Admin">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter admin username" autoFocus />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter admin password" />
          {error && (
            <div role="alert" style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(224,100,90,0.1)', color: 'var(--status-error)', fontSize: 13,
            }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!username || !password || creating}>
              {creating ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Admin">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Are you sure you want to delete admin <strong>{deleteTarget?.username}</strong>?
            Users created by this admin will remain but will no longer be associated with any admin.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              style={{ background: 'var(--status-error)', borderColor: 'var(--status-error)' }}
            >
              {deleting ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
              Delete Admin
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}

const thStyle = { textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 };
const tdStyle = { padding: '10px 12px', color: 'var(--text-secondary)' };
