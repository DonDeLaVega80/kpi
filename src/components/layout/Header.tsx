import { useEffect } from "react";

export function Header() {
  useEffect(() => {
    // Ensure light mode is always applied (remove dark class if present)
    document.documentElement.classList.remove("dark");
    // Clear any stored theme preference
    localStorage.removeItem("theme");
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        {/* Page title will be set by each page */}
      </div>
    </header>
  );
}

