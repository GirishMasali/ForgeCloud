import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../services/applicationService';
import {
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  EmptyState,
  SkeletonTableRows,
  SkeletonCard,
} from '../components/ui';
import {
  PlusCircle,
  Search,
  GitBranch,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Boxes,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

const RUNTIME_FILTERS = [
  { value: 'all', label: 'All Runtimes' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'python', label: 'Python' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'golang', label: 'Go' },
];

export default function ApplicationsPage() {
  const { isDeveloper } = useAuth();
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [runtimeFilter, setRuntimeFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await applicationService.getApplications();
      setApplications(data || []);
    } catch (err) {
      setError('Unable to load applications. Please verify your connection to the control plane.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.name.toLowerCase().includes(q) ||
      app.runtime.toLowerCase().includes(q) ||
      app.branch.toLowerCase().includes(q) ||
      (app.repository_url && app.repository_url.toLowerCase().includes(q));

    const matchesRuntime =
      runtimeFilter === 'all' || app.runtime.toLowerCase() === runtimeFilter.toLowerCase();

    return matchesSearch && matchesRuntime;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--fc-space-6)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1>Managed Applications</h1>
            {!isLoading && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--fc-bg-subtle)',
                  color: 'var(--fc-text-secondary)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--fc-radius-full)',
                  border: '1px solid var(--fc-border-subtle)',
                }}
              >
                {applications.length}
              </span>
            )}
          </div>
          <p>Service catalog of containerized workloads managed by ForgeCloud.</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            size="md"
            icon={RefreshCw}
            onClick={() => fetchApplications(true)}
            isLoading={isRefreshing}
            aria-label="Refresh application list"
          >
            Refresh
          </Button>
          {isDeveloper && (
            <Link to="/applications/create" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon={PlusCircle}>
                Register Application
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--fc-space-3)',
          flexWrap: 'wrap',
          maxWidth: '800px',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--fc-text-muted)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search applications by name, branch, or repo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search applications"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '140px' }}
            value={runtimeFilter}
            onChange={(e) => setRuntimeFilter(e.target.value)}
            aria-label="Filter by runtime"
          >
            {RUNTIME_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {(searchQuery || runtimeFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setRuntimeFilter('all');
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Content: Loading, Empty, or Table/Card views */}
      {isLoading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="responsive-table-desktop">
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead align="right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SkeletonTableRows rows={5} cols={7} />
                </TableBody>
              </Table>
            </div>
          </div>
          {/* Mobile Skeleton */}
          <div className="responsive-table-mobile">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} lines={3} />
            ))}
          </div>
        </>
      ) : filteredApps.length === 0 ? (
        searchQuery || runtimeFilter !== 'all' ? (
          <EmptyState
            title="No Matching Applications"
            description={`No application matched your search criteria.`}
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setRuntimeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Boxes}
            title="No Applications Registered"
            description="Get started by registering your first application service in ForgeCloud."
            action={
              isDeveloper && (
                <Link to="/applications/create" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" icon={PlusCircle}>
                    Register First Application
                  </Button>
                </Link>
              )
            }
          />
        )
      ) : (
        <>
          {/* 1. Desktop View: High-Density Data Table */}
          <div className="responsive-table-desktop">
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead align="right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Link
                          to={`/applications/${app.id}`}
                          style={{
                            fontWeight: 600,
                            color: 'var(--fc-text-primary)',
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                          }}
                        >
                          {app.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="configured">Configured</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            fontFamily: 'var(--fc-font-mono)',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            background: 'var(--fc-bg-subtle)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: 'var(--fc-radius-xs)',
                            border: '1px solid var(--fc-border-subtle)',
                          }}
                        >
                          {app.runtime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontFamily: 'var(--fc-font-mono)', fontSize: '0.8rem' }}>
                          {app.port}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            color: 'var(--fc-text-secondary)',
                          }}
                        >
                          <GitBranch size={13} aria-hidden="true" />
                          <span>{app.branch}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span style={{ fontSize: '0.8rem', color: 'var(--fc-text-muted)' }}>
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <Link to={`/applications/${app.id}`} style={{ textDecoration: 'none' }}>
                          <Button variant="ghost" size="sm" iconRight={ArrowRight}>
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 2. Mobile View (<768px): Responsive Stacked Cards */}
          <div className="responsive-table-mobile">
            {filteredApps.map((app) => (
              <Card key={app.id} style={{ padding: 'var(--fc-space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <Link
                      to={`/applications/${app.id}`}
                      style={{
                        fontWeight: 600,
                        color: 'var(--fc-text-primary)',
                        fontSize: '1rem',
                        textDecoration: 'none',
                      }}
                    >
                      {app.name}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--fc-text-muted)', marginTop: '2px' }}>
                      Registered on {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant="configured">Configured</Badge>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--fc-space-3)',
                    margin: 'var(--fc-space-3) 0',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--fc-font-mono)',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      background: 'var(--fc-bg-subtle)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--fc-radius-xs)',
                      border: '1px solid var(--fc-border-subtle)',
                    }}
                  >
                    {app.runtime}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: 'var(--fc-text-secondary)',
                    }}
                  >
                    <GitBranch size={13} aria-hidden="true" />
                    <span>{app.branch}</span>
                  </span>

                  <span
                    style={{
                      fontFamily: 'var(--fc-font-mono)',
                      fontSize: '0.8rem',
                      color: 'var(--fc-text-muted)',
                    }}
                  >
                    Port: {app.port}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--fc-space-2)' }}>
                  <Link to={`/applications/${app.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                    <Button variant="secondary" size="sm" iconRight={ArrowRight} style={{ width: '100%' }}>
                      Manage Workload
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
