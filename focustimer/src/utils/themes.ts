export interface Theme {
  id: string;
  name: string;
  group: 'dark' | 'light';
  colors: {
    primary: string;
    primaryHover: string;
    success: string;
    successHover: string;
    warning: string;
    bg: string;
    surface: string;
    surfaceHover: string;
    text: string;
    textMuted: string;
    border: string;
  };
}

export const themes: Theme[] = [
  // ===== Dark Themes =====
  {
    id: 'default-dark',
    name: 'Default Dark',
    group: 'dark',
    colors: {
      primary: '#ef4444',
      primaryHover: '#dc2626',
      success: '#22c55e',
      successHover: '#16a34a',
      warning: '#f59e0b',
      bg: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      border: '#334155',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    group: 'dark',
    colors: {
      primary: '#bd93f9',
      primaryHover: '#a87bf5',
      success: '#50fa7b',
      successHover: '#3be065',
      warning: '#f1fa8c',
      bg: '#282a36',
      surface: '#343746',
      surfaceHover: '#44475a',
      text: '#f8f8f2',
      textMuted: '#6272a4',
      border: '#44475a',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    group: 'dark',
    colors: {
      primary: '#88c0d0',
      primaryHover: '#7eb8c9',
      success: '#a3be8c',
      successHover: '#97b67e',
      warning: '#ebcb8b',
      bg: '#2e3440',
      surface: '#3b4252',
      surfaceHover: '#434c5e',
      text: '#eceff4',
      textMuted: '#81a1c1',
      border: '#434c5e',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    group: 'dark',
    colors: {
      primary: '#7aa2f7',
      primaryHover: '#6a94e6',
      success: '#9ece6a',
      successHover: '#8ebe5a',
      warning: '#e0af68',
      bg: '#1a1b26',
      surface: '#24283b',
      surfaceHover: '#2f3349',
      text: '#c0caf5',
      textMuted: '#565f89',
      border: '#2f3349',
    },
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    group: 'dark',
    colors: {
      primary: '#cba6f7',
      primaryHover: '#b48def',
      success: '#a6e3a1',
      successHover: '#94d990',
      warning: '#fab387',
      bg: '#1e1e2e',
      surface: '#313244',
      surfaceHover: '#45475a',
      text: '#cdd6f4',
      textMuted: '#a6adc8',
      border: '#45475a',
    },
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    group: 'dark',
    colors: {
      primary: '#fe8019',
      primaryHover: '#e57212',
      success: '#b8bb26',
      successHover: '#a5a820',
      warning: '#fabd2f',
      bg: '#282828',
      surface: '#3c3836',
      surfaceHover: '#504945',
      text: '#ebdbb2',
      textMuted: '#a89984',
      border: '#504945',
    },
  },

  // ===== Light Themes =====
  {
    id: 'default-light',
    name: 'Default Light',
    group: 'light',
    colors: {
      primary: '#ef4444',
      primaryHover: '#dc2626',
      success: '#16a34a',
      successHover: '#15803d',
      warning: '#d97706',
      bg: '#f8fafc',
      surface: '#ffffff',
      surfaceHover: '#f1f5f9',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
    },
  },
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    group: 'light',
    colors: {
      primary: '#8839ef',
      primaryHover: '#7529df',
      success: '#40a02b',
      successHover: '#368f24',
      warning: '#df8e1d',
      bg: '#eff1f5',
      surface: '#ffffff',
      surfaceHover: '#e6e9ef',
      text: '#4c4f69',
      textMuted: '#8c8fa1',
      border: '#ccd0da',
    },
  },
];

export function getThemeById(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}

export function applyTheme(themeId: string): void {
  const theme = getThemeById(themeId);
  const root = document.documentElement;

  root.setAttribute('data-theme', themeId);
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-primary-hover', theme.colors.primaryHover);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-success-hover', theme.colors.successHover);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-bg', theme.colors.bg);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-surface-hover', theme.colors.surfaceHover);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-muted', theme.colors.textMuted);
  root.style.setProperty('--color-border', theme.colors.border);
}
