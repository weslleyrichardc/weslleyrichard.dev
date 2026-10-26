import astroEslintParser from 'astro-eslint-parser'
import eslintPluginAstro from 'eslint-plugin-astro'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tsParser from '@typescript-eslint/parser'

export default [
	// Global ignores
	{
		ignores: ['dist/**', 'node_modules/**']
	},
	// Base config
	{
		files: ['**/*.js', '**/*.ts', '**/*.astro'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				sourceType: 'module',
				ecmaVersion: 'latest'
			}
		},
		plugins: {
			'@typescript-eslint': await import('@typescript-eslint/eslint-plugin')
		},
		rules: {
			// Add any global rules here
		}
	},
	// React files
	{
		files: ['**/*.tsx'],
		...jsxA11y.flatConfigs.recommended,
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
				sourceType: 'module',
				ecmaVersion: 'latest',
				ecmaFeatures: { jsx: true }
			}
		}
	},
	// Astro files
	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: astroEslintParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: ['.astro']
			}
		},
		plugins: {
			astro: eslintPluginAstro
		},
		rules: {
			...eslintPluginAstro.configs.recommended.rules
			// Override/add rules here
		}
	}
]
