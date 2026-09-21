import { useEffect, useState } from 'react';
import type { RouteId } from '../types';

const ROUTES: RouteId[] = [
  'landing',
  'wizard',
  'analyzing',
  'dashboard',
  'report',
  'gaps',
  'plan',
  'resume',
  'privacy',
];

function parseHash(): RouteId {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  return (ROUTES.find((route) => route === raw) ?? 'landing') as RouteId;
}

export function useHashRoute(): [RouteId, (route: RouteId) => void] {
  const [route, setRoute] = useState<RouteId>(parseHash);

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (next: RouteId) => {
    if (parseHash() === next) {
      setRoute(next);
      return;
    }
    window.location.hash = `#/${next}`;
  };

  return [route, navigate];
}

export function routeHref(route: RouteId): string {
  return `#/${route}`;
}
