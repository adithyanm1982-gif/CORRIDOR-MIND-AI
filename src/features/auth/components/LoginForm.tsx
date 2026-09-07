import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'Engineering', label: 'Engineering Dept' },
  { value: 'Traction', label: 'Traction Distribution (TRD)' },
  { value: 'S&T', label: 'Signal & Telecommunication (S&T)' },
  { value: 'CONTROLLER', label: 'Section Controller' },
];

/**
 * Mock login -- issues a session token and role-tagged user so the
 * rest of the app (DeptGuardRoute, Navbar's per-role nav filtering,
 * Approvals) can branch on role. Department values match the real
 * backend exactly ('Engineering' | 'S&T' | 'Traction'), not the
 * earlier placeholder enum.
 */
export function LoginForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Engineering');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    login(
      {
        id: `user_${Date.now()}`,
        name,
        role,
        department: role === 'CONTROLLER' ? undefined : role,
      },
      `mock_token_${Date.now()}`
    );

    // Controllers land on Approvals (their actual job); dept users land on Requests.
    navigate(role === 'CONTROLLER' ? '/approvals' : '/requests');
  }

  return (
    <form onSubmit={handleSubmit} className="panel-surface w-full max-w-sm rounded-xl p-6 space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Corridor Mind AI Login</h1>
        <p className="text-sm text-slate-400">SIH 26027 — Integrated Block Management</p>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-dept-engineering"
          placeholder="e.g. R. Sharma"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-slate-400">Department / Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full rounded-md bg-slate-900/60 border border-slate-700 px-3 py-2 text-sm focus:outline-none focus:border-dept-engineering"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-dept-engineering/90 hover:bg-dept-engineering text-slate-950 font-medium py-2 text-sm transition-colors"
      >
        Sign in
      </button>
    </form>
  );
}
