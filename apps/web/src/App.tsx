import { Navigate, Route, Routes } from 'react-router-dom';
import { Button } from '@skillgap/ui';

function Placeholder({ title }: { title: string }): React.JSX.Element {
  return (
    <main className="min-h-screen bg-background p-8 text-text-primary">
      <div className="mx-auto max-w-4xl rounded-card border border-border bg-white p-8 shadow-card">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">SkillGap AI</p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-4 text-text-secondary">Scaffold ready for the full SkillGap AI product surface.</p>
        <div className="mt-6 flex gap-3">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary action</Button>
        </div>
      </div>
    </main>
  );
}

export default function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Landing page" />} />
      <Route path="/login" element={<Placeholder title="Login" />} />
      <Route path="/register" element={<Placeholder title="Register" />} />
      <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
      <Route path="/jobs" element={<Placeholder title="Jobs" />} />
      <Route path="/jobs/:id" element={<Placeholder title="Job detail" />} />
      <Route path="/applications" element={<Placeholder title="Applications" />} />
      <Route path="/applications/:id" element={<Placeholder title="Application detail" />} />
      <Route path="/profile" element={<Placeholder title="Profile" />} />
      <Route path="/company/*" element={<Placeholder title="Company portal" />} />
      <Route path="/admin/*" element={<Placeholder title="Admin panel" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
