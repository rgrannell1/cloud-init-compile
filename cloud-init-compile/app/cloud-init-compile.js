
const errors = require('@rgrannell/errors')

const path = require('path')
const constants = require('../commons/constants')
const bundleContent = require('./bundle-content')

const compile = {}

/**
 * The core function. Takes CLI-provided arguments and validates them, then calls
 * the code to generate the cloud-init script.
 *
 * @param {*} rawArgs
 */
compile.cli = rawArgs => {
	return compile.api(compile.preprocess(rawArgs))
}

compile.api = rawArgs => {
	const args = compile.precond(rawArgs)

	if (args.version) {
		console.log(constants.package.version)
	} else {
		return bundleContent(args.fpaths, {
			toRun: args.toRun,
			encoding: args.encoding,
			shouldGzip: args.shouldGzip
		})

	}
}

/**
 * Check that the supplied arguments meet the required input formats.
 *
 * @param {Object} rawArgs semi-processed arguments
 *
 * @returns {Object} provided arguments
 */
compile.precond = rawArgs => {
	const detectedBaseNames = new Set( )

	if (!rawArgs.fpaths) {
		throw errors.internalError('fpaths was missing from arguments supplied to cloud-init-compile. This is a program error.', 'internalError')
	}

	if (!Array.isArray(rawArgs.fpaths)) {
		throw errors.internalError('fpaths was not an array of paths.', 'internalError')

	}

	// -- check for duplicates.
	rawArgs.fpaths.forEach(fpath => {
		const fname = path.basename(fpath)

		if (detectedBaseNames.has(fname)) {
			throw errors.duplicateFile(`file-name ${fname} was repeated in file-path ${fpath}`, 'duplicateFile')
		} else {
			detectedBaseNames.add(fname)
		}
	})

	const runBasename = path.basename(rawArgs.toRun)

	// -- check the executable file is present.
	if (!detectedBaseNames.has(runBasename)) {
		throw errors.missingPath(`error: attempting to run file "${runBasename}" that will not be included in the output script.`, 'missingPath')
	}

	return rawArgs
}

/**
 * Parse the arguments provided by the CLI
 *
 * @param {Object} rawArgs
 *
 * @returns {Object} parsed arguments
 */
compile.preprocess = rawArgs => {
	// -- default to base64, but allow --hex or --utf8 or another
	// -- encoding to be specified.
	const encoding = Object.keys(rawArgs).reduce((selected, option) => {
		// -- fetch the value and option name.
		const value = rawArgs[option]
		const optionName = option.replace(/^--/, '')

		return constants.supportedEncodings.has(optionName) && value === true
			? optionName
			: selected

	}, constants.defaults.encoding)

	return {
		encoding,
		shouldGzip: rawArgs['--gzip'],
		fpaths: rawArgs['<fpath>'],
		toRun: rawArgs['--run'],
		version: rawArgs['--version']
	}
}

module.exports = compile
