const { eslintConfig } = require('./package.json')
eslintConfig.parser = '@typescript-eslint/parser'
eslintConfig.extends.push('plugin:@typescript-eslint/recommended')

eslintConfig.rules = {
  'comma-dangle': ['error', 'only-multiline'],
  'no-useless-constructor': 'off',
  'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
  semi: ['error', 'always'],
  'space-before-function-paren': ['error', 'never']
}

module.exports = eslintConfig
