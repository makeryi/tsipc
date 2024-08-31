import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'dev',
        'docs',
        'feat',
        'fix',
        'optimize',
        'perf',
        'refactor',
        'release',
        'revert',
        'rollback',
        'style',
        'test',
        'wip'
      ]
    ]
  }
}

export default config
