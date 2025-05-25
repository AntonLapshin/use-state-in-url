import React, { useState, useEffect, useCallback } from 'react';
import { useStateInUrl, useBatchUpdate } from 'use-state-in-url';

interface LocationLike {
  pathname: string;
  search: string;
}

function useBrowserHistory() {
  const [loc, setLoc] = useState<LocationLike>({
    pathname: window.location.pathname,
    search: window.location.search,
  });

  useEffect(() => {
    const onPop = () =>
      setLoc({ pathname: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((url: string) => {
    window.history.pushState({}, '', url);
    setLoc({ pathname: window.location.pathname, search: window.location.search });
  }, []);

  return { location: loc, navigate };
}

export default function App() {
  const { location, navigate } = useBrowserHistory();
  const [term, setTerm, mutateTerm] = useStateInUrl('term', { location, navigate });
  const [page, setPage, mutatePage] = useStateInUrl({ name: 'page', type: 'number', defaultValue: 1 }, { location, navigate });
  const [active, setActive, mutateActive] = useStateInUrl({ name: 'active', type: 'boolean', defaultValue: false }, { location, navigate });
  const [tags, setTags] = useStateInUrl<string[]>({ name: 'tags', type: 'array', defaultValue: [] }, { location, navigate });
  const [filters, setFilters] = useStateInUrl<Record<string, unknown>>({ name: 'filters', type: 'object', defaultValue: {} }, { location, navigate });
  const { batchUpdate } = useBatchUpdate({ location, navigate });

  const handleBatch = () => {
    batchUpdate([
      mutateTerm('hello'),
      mutatePage(page + 1),
      mutateActive(!active),
    ]);
  };

  return (
    <div>
      <div>
        term: <input value={term || ''} onChange={e => setTerm(e.target.value)} />
      </div>
      <div>
        page: <input type="number" value={page} onChange={e => setPage(Number(e.target.value))} />
      </div>
      <div>
        active: <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
      </div>
      <div>
        <button onClick={() => setTags(['tag1', 'tag2'])}>Set Tags</button>
      </div>
      <div>
        <button onClick={() => setFilters({ foo: 'bar' })}>Set Filters</button>
      </div>
      <button onClick={handleBatch}>Batch Update</button>
      <pre>{location.pathname + location.search}</pre>
    </div>
  );
}
