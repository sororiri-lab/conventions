import comments from '@eslint-community/eslint-plugin-eslint-comments';
import tseslint from 'typescript-eslint';
import classSuffix from './rules/class-suffix.js';
import filePerRole from './rules/file-per-role.js';
import noSqlInController from './rules/no-sql-in-controller.js';
import requiredFiles from './rules/required-files.js';

/**
 * 프로젝트 공통 코드 관례. 규칙 목록·붙이는 법은 specmu 의 conventions 프로젝트에 있다.
 *
 *   // eslint.config.mjs
 *   import conventions from '@sororiri/conventions';
 *   export default [...conventions.configs.recommended];
 */
const plugin = {
  meta: { name: '@sororiri/conventions', version: '0.2.0' },
  rules: {
    'file-per-role': filePerRole,
    'required-files': requiredFiles,
    'class-suffix': classSuffix,
    'no-sql-in-controller': noSqlInController,
  },
};

plugin.configs = {
  recommended: [
    {
      files: ['**/*.ts'],
      languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
      plugins: {
        conventions: plugin,
        '@typescript-eslint': tseslint.plugin,
        '@eslint-community/eslint-comments': comments,
      },
      linterOptions: { reportUnusedDisableDirectives: 'error' },
      rules: {
        'conventions/file-per-role': 'error',
        'conventions/required-files': 'error',
        'conventions/class-suffix': 'error',
        'conventions/no-sql-in-controller': 'error',
        '@typescript-eslint/naming-convention': ['error', { selector: 'class', format: ['PascalCase'] }],
        // 규칙을 줄 단위로 끌 때는 이유를 적는다: // eslint-disable-next-line conventions/… -- 이유
        '@eslint-community/eslint-comments/require-description': 'error',
      },
    },
  ],
};

export default plugin;
