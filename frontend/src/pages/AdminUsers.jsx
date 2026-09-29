import { useEffect, useState } from 'react';
import { UserPlus, ShieldPlus, KeyRound, Loader2 } from 'lucide-react';
import { listUsers, createUser, createAdmin, changeUserPassword } from '../services/adminService';
import { formatDate } from '../utils/formatters';
import useAuthStore from '../store/authStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import PageTransition from '../components/common/PageTransition';

export default function AdminUsers() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === 'superadmin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const load = () => {
    listUsers()
      .then(data => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e, isAdmin = false) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      if (isAdmin) {
        await createAdmin(username, password);
        setAdminModalOpen(false);
      } else {
        await createUser(username, password);
        setModalOpen(false);
      }
      setUsername('');
      setPassword('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || (isAdmin ? 'Failed to create admin' : 'Failed to create user'));
    }
    setCreating(false);
  };

  const openPasswordModal = (u) => {
    setSelectedUser(u);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordModalOpen(true);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await changeUserPassword(selectedUser.id, newPassword);
      setPasswordSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordModalOpen(false), 1200);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password');
    }
    setChangingPassword(false);
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
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Users</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          {isSuperAdmin && (
            <Button variant="secondary" onClick={() => { setAdminModalOpen(true); setError(''); }}>
              <ShieldPlus size={16} /> Create Admin
            </Button>
          )}
          <Button onClick={() => { setModalOpen(true); setError(''); }}>
            <UserPlus size={16} /> Create User
          </Button>
        </div>
      </div>

      <div className="bento-tile">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Role</th>
                {isSuperAdmin && <th style={thStyle}>Created By</th>}
                <th style={thStyle}>Images</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="table-row" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={tdStyle}>{u.username}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 500,
                      background: u.role === 'superadmin' ? 'rgba(212,164,76,0.15)' : u.role === 'admin' ? 'var(--accent-sage-dim)' : 'var(--accent-blue-dim)',
                      color: u.role === 'superadmin' ? '#d4a44c' : u.role === 'admin' ? 'var(--accent-sage)' : 'var(--accent-blue)',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  {isSuperAdmin && <td style={tdStyle}>{u.created_by_username || '—'}</td>}
                  <td style={tdStyle}>{u.image_count}</td>
                  <td style={tdStyle}>{formatDate(u.created_at)}</td>
                  <td style={tdStyle}>
                    <Button variant="ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openPasswordModal(u)}>
                      <KeyRound size={14} /> Change Password
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setError(''); }} title="Create New User">
        <form onSubmit={(e) => handleCreate(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoFocus />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
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
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Admin Modal */}
      {isSuperAdmin && (
        <Modal open={adminModalOpen} onClose={() => { setAdminModalOpen(false); setError(''); }} title="Create New Admin">
          <form onSubmit={(e) => handleCreate(e, true)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <Button variant="secondary" type="button" onClick={() => setAdminModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!username || !password || creating}>
                {creating ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                Create Admin
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Change Password Modal */}
      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title={`Change Password — ${selectedUser?.username || ''}`}>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoFocus
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          {passwordError && (
            <div role="alert" style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(224,100,90,0.1)', color: 'var(--status-error)', fontSize: 13,
            }}>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div role="status" style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(76,175,80,0.1)', color: '#4caf50', fontSize: 13,
            }}>
              {passwordSuccess}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Button variant="secondary" type="button" onClick={() => setPasswordModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!newPassword || !confirmPassword || changingPassword}>
              {changingPassword ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}

const thStyle = { textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontWeight: 500, fontSize: 12 };
const tdStyle = { padding: '10px 12px', color: 'var(--text-secondary)' };
