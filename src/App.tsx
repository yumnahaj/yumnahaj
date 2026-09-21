import { CheckCircle2 } from 'lucide-react';
import { AppProvider, useApp } from './state/AppState';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Wizard } from './pages/Wizard';
import { Analyzing } from './pages/Analyzing';
import { Dashboard } from './pages/Dashboard';
import { Report } from './pages/Report';
import { Gaps } from './pages/Gaps';
import { Plan } from './pages/Plan';
import { Resume } from './pages/Resume';
import { Privacy } from './pages/Privacy';

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <CheckCircle2 size={17} />
      {toast}
    </div>
  );
}

function Routes() {
  const { route } = useApp();

  if (route === 'landing') return <Landing />;
  if (route === 'analyzing') return <Analyzing />;

  return (
    <Layout>
      {route === 'wizard' ? <Wizard /> : null}
      {route === 'dashboard' ? <Dashboard /> : null}
      {route === 'report' ? <Report /> : null}
      {route === 'gaps' ? <Gaps /> : null}
      {route === 'plan' ? <Plan /> : null}
      {route === 'resume' ? <Resume /> : null}
      {route === 'privacy' ? <Privacy /> : null}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Routes />
      <Toast />
    </AppProvider>
  );
}
