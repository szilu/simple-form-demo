const extensions = ['.js', '.ts', '.tsx']
const isProd = process.env.NODE_ENV === 'production'

import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import progress from 'rollup-plugin-progress'
import gzip from 'rollup-plugin-gzip'
import size from 'rollup-plugin-size'

export default {
	input: 'main.tsx',
	output: {
		dir: isProd ? './dist/assets' : './dist/assets-dev',
		assetFileNames: '[name].[ext]',
		name: 'main',
		format: 'iife'
	},
	plugins: [
		alias({
			entries: [
				{ find: '~', replacement: __dirname }
			]
		}),
		replace({
			'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
		}),
		resolve({ extensions }),
		typescript({ module: 'ES2015' }),
		commonjs(),
		isProd && terser(),
		gzip(),
		size(),
		progress()
	],
	// This is needed because typescript generates buggy ES6 module files:
	onwarn: (warning, warn) => warning.code === 'THIS_IS_UNDEFINED' || warn(warning)
}

// vim: ts=4
