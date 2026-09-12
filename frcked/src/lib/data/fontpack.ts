export interface FontOption {
  id: string;
  label: string;
  category: 'sans' | 'serif' | 'mono';
  stack: string;
}

export const FONT_OPTIONS: FontOption[] = [
  // Sans-Serif
  {
    id: 'system-ui',
    label: 'System Interface',
    category: 'sans',
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  {
    id: 'helvetica',
    label: 'Helvetica / Arial',
    category: 'sans',
    stack: '"Helvetica Neue", Helvetica, Arial, sans-serif'
  },
  {
    id: 'segoe',
    label: 'Segoe UI',
    category: 'sans',
    stack: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  {
    id: 'verdana',
    label: 'Verdana',
    category: 'sans',
    stack: 'Verdana, Geneva, sans-serif'
  },

  // Serif
  {
    id: 'georgia',
    label: 'Georgia',
    category: 'serif',
    stack: 'Georgia, Cambria, "Times New Roman", serif'
  },
  {
    id: 'baskerville',
    label: 'Baskerville',
    category: 'serif',
    stack: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Garamond, serif'
  },
  {
    id: 'palatino',
    label: 'Palatino',
    category: 'serif',
    stack: '"Palatino Linotype", "Book Antiqua", Palatino, serif'
  },
  {
    id: 'garamond',
    label: 'Garamond',
    category: 'serif',
    stack: 'Garamond, "EB Garamond", "Times New Roman", serif'
  },

  // Monospace
  {
    id: 'system-mono',
    label: 'System Code',
    category: 'mono',
    stack: 'ui-monospace, "SF Mono", "Cascadia Code", Consolas, Menlo, monospace'
  },
  {
    id: 'consolas',
    label: 'Consolas',
    category: 'mono',
    stack: 'Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace'
  },
  {
    id: 'courier',
    label: 'Courier New',
    category: 'mono',
    stack: '"Courier New", Courier, monospace'
  }
];