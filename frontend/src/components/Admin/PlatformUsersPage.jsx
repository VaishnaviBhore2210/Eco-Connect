
import { useEffect, useState } from 'react';
import './PlatformUsersPage.css';

export default function PlatformUsersPage() {
  const [users, setUsers] = useState({
    urbanGenerators: [],
    cooperatives: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Unable to load platform users.');
        }

        const data = await response.json();

        if (!cancelled) {
          setUsers({
            urbanGenerators: data.urbanGenerators || [],
            cooperatives: data.cooperatives || [],
          });
          setError('');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load users.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();
    const intervalId = window.setInterval(loadUsers, 10000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const renderTable = (title, rows, cooperative = false) => (
    <section className="platform-users-card">
      <div className="platform-users-card-heading">
        <h2>{title}</h2>
        <span>{rows.length} registered</span>
      </div>

      <div className="platform-users-table-wrap">
        <table className="platform-users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{cooperative ? 'Organization' : 'Full Name'}</th>
              {cooperative && <th>Coordinator</th>}
              <th>Email</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cooperative ? 5 : 4} className="platform-users-empty">
                  No users registered yet.
                </td>
              </tr>
            ) : (
              rows.map((person, index) => (
                <tr key={person.id ?? person.email ?? index}>
                  <td>{index + 1}</td>
                  <td>
                    {cooperative
                      ? person.organizationName || '—'
                      : person.fullName || '—'}
                  </td>
                  {cooperative && <td>{person.fullName || '—'}</td>}
                  <td>{person.email || '—'}</td>
                  <td>{person.location || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <main className="platform-users-page">
      <div className="platform-users-page-heading">
        <p className="eyebrow">ADMINISTRATION</p>
        <h1>Platform Users</h1>
        <p>View registered waste generators and cooperative coordinators.</p>
      </div>

      {loading && <p>Loading registered users...</p>}
      {error && <p className="platform-users-error" role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="platform-users-summary">
            <article>
              <span>Urban Waste Generators</span>
              <strong>{users.urbanGenerators.length}</strong>
            </article>
            <article>
              <span>Cooperatives</span>
              <strong>{users.cooperatives.length}</strong>
            </article>
            <article>
              <span>Total Registered Users</span>
              <strong>
                {users.urbanGenerators.length + users.cooperatives.length}
              </strong>
            </article>
          </div>

          {renderTable('Urban Waste Generators', users.urbanGenerators)}
          {renderTable('Cooperatives', users.cooperatives, true)}
        </>
      )}
    </main>
  );
}
