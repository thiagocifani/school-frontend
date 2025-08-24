// Configuração de tema centralizada para o sistema escolar - Tema Claro
export const theme = {
  colors: {
    // Cores principais
    primary: 'var(--primary)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryForeground: 'var(--secondary-foreground)',
    accent: 'var(--accent)',
    accentForeground: 'var(--accent-foreground)',
    
    // Cores de estado
    success: 'var(--success)',
    successForeground: 'var(--success-foreground)',
    warning: 'var(--warning)',
    warningForeground: 'var(--warning-foreground)',
    error: 'var(--error)',
    errorForeground: 'var(--error-foreground)',
    
    // Cores neutras
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    border: 'var(--border)',
    input: 'var(--input)',
    ring: 'var(--ring)',
    
    // Cores de componentes
    card: 'var(--card)',
    cardForeground: 'var(--card-foreground)',
    popover: 'var(--popover)',
    popoverForeground: 'var(--popover-foreground)',
    
    // Novas cores para tema claro
    surface: 'var(--surface)',
    surfaceForeground: 'var(--surface-foreground)',
    highlight: 'var(--highlight)',
    highlightForeground: 'var(--highlight-foreground)',
  },
  
  // Estilos de componentes
  components: {
    card: {
      background: 'var(--card)',
      border: '1px solid var(--border)',
      color: 'var(--card-foreground)',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
    button: {
      primary: {
        background: 'var(--primary)',
        color: 'var(--primary-foreground)',
        hover: 'var(--primary)',
        shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      secondary: {
        background: 'var(--secondary)',
        color: 'var(--secondary-foreground)',
        border: '1px solid var(--border)',
        hover: 'var(--muted)',
      },
      accent: {
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
        hover: 'var(--accent)',
        shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
    sidebar: {
      background: 'var(--card)',
      border: '1px solid var(--border)',
      text: 'var(--muted-foreground)',
      textHover: 'var(--primary)',
      backgroundHover: 'var(--muted)',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    input: {
      background: 'var(--input)',
      border: '1px solid var(--border)',
      color: 'var(--foreground)',
      focus: 'var(--ring)',
      placeholder: 'var(--muted-foreground)',
    },
  },
  
  // Transições
  transitions: {
    default: 'transition-all duration-200',
    colors: 'transition-colors duration-200',
    transform: 'transition-transform duration-200',
    shadow: 'transition-shadow duration-200',
  },
  
  // Sombras para tema claro
  shadows: {
    soft: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    medium: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    large: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  
  // Gradientes para tema claro
  gradients: {
    primary: 'linear-gradient(135deg, var(--primary) 0%, var(--highlight-foreground) 100%)',
    surface: 'linear-gradient(135deg, var(--surface) 0%, var(--muted) 100%)',
    highlight: 'linear-gradient(135deg, var(--highlight) 0%, var(--surface) 100%)',
  },
} as const;

// Função helper para aplicar estilos inline
export const applyTheme = (component: keyof typeof theme.components, variant?: string) => {
  const componentStyles = theme.components[component];
  
  if (variant && typeof componentStyles === 'object' && variant in componentStyles) {
    return (componentStyles as any)[variant];
  }
  
  return componentStyles;
};

// Função helper para obter cores
export const getColor = (color: keyof typeof theme.colors) => {
  return theme.colors[color];
};

// Função helper para aplicar transições
export const getTransition = (type: keyof typeof theme.transitions) => {
  return theme.transitions[type];
};

// Função helper para aplicar sombras
export const getShadow = (type: keyof typeof theme.shadows) => {
  return theme.shadows[type];
};

// Função helper para aplicar gradientes
export const getGradient = (type: keyof typeof theme.gradients) => {
  return theme.gradients[type];
};
