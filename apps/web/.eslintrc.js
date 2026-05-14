module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  // We intentionally don't extend @gravity-ui/eslint-config in this seed because
  // its rule set assumes a pure Gravity package layout. The Nebius web team can
  // swap it in at any time:
  //   extends: ['@gravity-ui/eslint-config', '@gravity-ui/eslint-config/import-order', 'next/core-web-vitals']
  rules: {
    'react/no-unescaped-entities': 'off',
  },
};
