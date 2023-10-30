module.exports = {
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
	},
	extends: 'eslint:recommended',
	overrides: [
		{
			env: {
				node: true,
			},
			files: ['.eslintrc.{js,cjs}'],
			parserOptions: {
				sourceType: 'script',
			},
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
	},
	ignorePatterns: [
		'/node_modules',
		'/submodules',
		'./package*.json',
		'/uploads',
		'/tmp',
	],
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],
	},
};
