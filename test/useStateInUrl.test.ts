import { renderHook, act } from '@testing-library/react';
import { useStateInUrl, useBatchUpdate, StateParam } from '../src';

type Loc = { pathname: string; search: string };

const createLocation = (search: string = '', pathname: string = '/') => ({ pathname, search });

const createWrapper = (location: Loc, navigate: (url: string) => void) =>
  ({ children }: { children: React.ReactNode }) => children;

describe('useStateInUrl', () => {
  test('string param', () => {
    const navigate = jest.fn();
    let location = createLocation('');

    const { result, rerender } = renderHook(({ loc }) =>
      useStateInUrl('q', { location: loc, navigate }),
      { initialProps: { loc: location } }
    );

    expect(result.current[0]).toBeUndefined();

    act(() => {
      result.current[1]('hello');
    });

    expect(navigate).toHaveBeenCalledWith('/?q=hello');

    location = createLocation('?q=hello');
    rerender({ loc: location });
    expect(result.current[0]).toBe('hello');
  });

  test('number param with default', () => {
    const navigate = jest.fn();
    let location = createLocation('');
    const param: StateParam<number> = { name: 'page', type: 'number', defaultValue: 1 };

    const { result, rerender } = renderHook(({ loc }) =>
      useStateInUrl(param, { location: loc, navigate }),
      { initialProps: { loc: location } }
    );

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](2);
    });

    expect(navigate).toHaveBeenCalledWith('/?page=2');

    location = createLocation('?page=2');
    rerender({ loc: location });
    expect(result.current[0]).toBe(2);
  });
});

describe('batch update', () => {
  test('updates multiple', () => {
    const navigate = jest.fn();
    const location = createLocation('?q=hi&page=1');

    const { result: term } = renderHook(() =>
      useStateInUrl('q', { location, navigate })
    );
    const { result: page } = renderHook(() =>
      useStateInUrl<number>({ name: 'page', type: 'number' }, { location, navigate })
    );
    const { result: batch } = renderHook(() =>
      useBatchUpdate({ location, navigate })
    );

    act(() => {
      batch.current.batchUpdate([
        term.current[2]('hello'),
        page.current[2](2)
      ]);
    });

    expect(navigate).toHaveBeenCalledWith('?q=hello&page=2');
  });
});
