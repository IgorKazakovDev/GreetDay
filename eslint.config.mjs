import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.expo',
      '**/coverage',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      // Project boundaries: see "Boundaries" in the root CLAUDE.md.
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            // mobile → contracts, domain, design-tokens (never db)
            {
              sourceTag: 'scope:mobile',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:ui'],
            },
            // api → contracts, domain, db
            {
              sourceTag: 'scope:api',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:db'],
            },
            // db is a leaf apart from shared libs, and only api may import it
            {
              sourceTag: 'scope:db',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // contracts and domain: pure, import only each other
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            // design-tokens: pure data, no workspace deps
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'type:lib',
              onlyDependOnLibsWithTags: ['type:lib'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
];
