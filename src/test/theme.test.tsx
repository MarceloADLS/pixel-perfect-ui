import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "@/lib/theme";

afterEach(() => { localStorage.clear(); document.documentElement.classList.remove("dark"); });

describe("Appearance preference", () => {
  it("switches between light and dark and remembers the choice", async () => {
    const { result, unmount } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    act(() => result.current.setTheme("light"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("lume-theme")).toBe("light");
    unmount();
    const restored = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    await waitFor(() => expect(restored.result.current.theme).toBe("light"));
    act(() => restored.result.current.setTheme("dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("lume-theme")).toBe("dark");
  });
});