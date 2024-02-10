/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard'],
  rules: {
    'comment-empty-line-before': 'never',
    'selector-class-pattern': '',
  },
};

module.exports = config;
