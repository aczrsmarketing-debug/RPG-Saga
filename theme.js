// Tema estricto con paleta de colores HEX especificada
export const COLORS = {
  // Fondos principales
  background: '#FEF1D5',
  backgroundAlt: '#E0E0E0',
  
  // Gráficos y elementos principales
  primary: '#679CBC',
  secondary: '#A38560',
  
  // Detalles y acentos
  danger: '#C11720',
  darkBlue: '#0C324A',
  darkGreen: '#16302B',
  darkRed: '#390517',
  darkest: '#03110D',
  
  // UI Elements
  cardBg: '#FFFFFF',
  textPrimary: '#03110D',
  textSecondary: '#16302B',
  border: '#A38560',
  
  // Dark mode
  darkBg: '#03110D',
  darkCard: '#16302B',
  darkText: '#FEF1D5',
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RANKS = {
  E: { name: 'E', color: '#A38560', minPoints: 0 },
  D: { name: 'D', color: '#679CBC', minPoints: 100 },
  C: { name: 'C', color: '#679CBC', minPoints: 300 },
  B: { name: 'B', color: '#0C324A', minPoints: 600 },
  A: { name: 'A', color: '#16302B', minPoints: 1000 },
  S: { name: 'S', color: '#C11720', minPoints: 1500 },
};

export const STATS_TYPES = {
  SALUD: 'Salud',
  MENTE: 'Mente',
  VIDA: 'Vida',
};
