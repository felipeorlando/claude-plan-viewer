import { useEffect, useState } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

type Theme = "light" | "system" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem("plans-viewer-theme");
  if (stored === "light" || stored === "dark" || stored === "system")
    return stored;
  return "system";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle(
        "dark",
        resolveTheme(theme) === "dark",
      );
    };
    apply();
    localStorage.setItem("plans-viewer-theme", theme);

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [theme]);

  const options: { value: Theme; icon: typeof SunIcon; label: string }[] = [
    { value: "light", icon: SunIcon, label: "Light mode" },
    { value: "system", icon: MonitorIcon, label: "System theme" },
    { value: "dark", icon: MoonIcon, label: "Dark mode" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border p-0.5 w-fit self-end">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
            theme === value
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={label}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
