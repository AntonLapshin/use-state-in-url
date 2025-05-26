import { renderHook, act } from "@testing-library/react";
import { useStateInUrl, useBatchUpdate } from "./index";

type Loc = { pathname: string; search: string };

const createLocation = (search: string = "", pathname: string = "/") => ({
  pathname,
  search,
});

describe("useStateInUrl", () => {
  test("string param", () => {
    const navigate = jest.fn();
    let location = createLocation("");

    const { result, rerender } = renderHook(
      ({ loc }: { loc: Loc }) => useStateInUrl("q", { location: loc, navigate }),
      { initialProps: { loc: location } }
    );

    expect(result.current[0]).toBe("");

    act(() => {
      result.current[1]("hello");
    });

    expect(navigate).toHaveBeenCalledWith("/?q=hello");

    location = createLocation("?q=hello");
    rerender({ loc: location });
    expect(result.current[0]).toBe("hello");
  });

  test("number param with default", () => {
    const navigate = jest.fn();
    let location = createLocation("");

    const { result, rerender } = renderHook(
      ({ loc }: { loc: Loc }) =>
        useStateInUrl(
          { name: "page", defaultValue: 1 },
          { location: loc, navigate }
        ),
      { initialProps: { loc: location } }
    );

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1](2);
    });

    expect(navigate).toHaveBeenCalledWith("/?page=2");

    location = createLocation("?page=2");
    rerender({ loc: location });
    expect(result.current[0]).toBe(2);
  });

  test("boolean param", () => {
    const navigate = jest.fn();
    let location = createLocation("");

    const { result, rerender } = renderHook(
      ({ loc }: { loc: Loc }) =>
        useStateInUrl(
          { name: "active", defaultValue: false },
          { location: loc, navigate }
        ),
      { initialProps: { loc: location } }
    );

    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1](true);
    });

    expect(navigate).toHaveBeenCalledWith("/?active=true");

    location = createLocation("?active=true");
    rerender({ loc: location });
    expect(result.current[0]).toBe(true);
  });

  test("array param", () => {
    const navigate = jest.fn();
    let location = createLocation("");

    const { result, rerender } = renderHook(
      ({ loc }: { loc: Loc }) =>
        useStateInUrl(
          { name: "tags", defaultValue: [] as string[] },
          { location: loc, navigate }
        ),
      { initialProps: { loc: location } }
    );

    expect(result.current[0]).toEqual([]);

    act(() => {
      result.current[1](["a", "b"]);
    });

    expect(navigate).toHaveBeenCalledWith("/?tags=a,b");

    location = createLocation("?tags=a,b");
    rerender({ loc: location });
    expect(result.current[0]).toEqual(["a", "b"]);
  });

  test("setting value back to default removes query param", () => {
    const navigate = jest.fn();
    let location = createLocation("");

    const { result, rerender } = renderHook(
      ({ loc }: { loc: Loc }) =>
        useStateInUrl(
          { name: "page", defaultValue: 1 },
          { location: loc, navigate }
        ),
      { initialProps: { loc: location } }
    );

    // Initially should be default value
    expect(result.current[0]).toBe(1);

    // Set to non-default value
    act(() => {
      result.current[1](2);
    });

    expect(navigate).toHaveBeenCalledWith("/?page=2");

    location = createLocation("?page=2");
    rerender({ loc: location });
    expect(result.current[0]).toBe(2);

    // Set back to default value - should remove from URL
    act(() => {
      result.current[1](1);
    });

    expect(navigate).toHaveBeenCalledWith("/");
  });
});

describe("batch update", () => {
  test("updates multiple", () => {
    const navigate = jest.fn();
    const location = createLocation("?q=hi&page=1");

    const { result: term } = renderHook(() =>
      useStateInUrl("q", { location, navigate })
    );
    const { result: page } = renderHook(() =>
      useStateInUrl({ name: "page", defaultValue: 0 }, { location, navigate })
    );
    const { result: batch } = renderHook(() =>
      useBatchUpdate({ location, navigate })
    );

    act(() => {
      batch.current.batchUpdate([term.current[2]("hello"), page.current[2](2)]);
    });

    expect(navigate).toHaveBeenCalledWith("/?q=hello&page=2");
  });
});
