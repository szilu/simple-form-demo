const extensions = ['.js', '.ts', '.tsx']
const isProd = process.env.NODE_ENV === 'production'

import analyze from 'rollup-plugin-analyzer'
import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import gzip from 'rollup-plugin-gzip'

import * as path from 'path'
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

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
			preventAssignment: true,
			'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
		}),
		resolve({ extensions }),
		typescript(),
		commonjs(),
		isProd && terser(),
		gzip(),
		isProd && analyze({ summaryOnly: true, limit: 10 })
	],
	// This is needed because typescript generates buggy ES6 module files:
	onwarn: (warning, warn) => warning.code === 'THIS_IS_UNDEFINED' || warn(warning)
}

// vim: ts=4
