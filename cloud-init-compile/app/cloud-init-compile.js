
"use strict"




const path          = require('path')
const constants     = require('../commons/constants')
const bundleContent = require('./bundle-content')





const compile = (rawArgs, callback) => {

	const args = compile.precond(compile.preprocess(rawArgs))

	if (args.version) {

		console.log(constants.package.version)

		callback(null)

	} else {

		bundleContent(args.fpaths, {
			toRun:      args.toRun,
			encoding:   args.encoding,
			shouldGzip: args.shouldGzip
		}, callback)

	}

}

compile.precond = rawArgs => {

	const detectedBaseNames = new Set( )

	rawArgs.fpaths.forEach(fpath => {

		const fname = path.basename(fpath)

		if (detectedBaseNames.has(fname)) {

			console.error(`error: file-name "${fname}" was repeated in file-path "${fpath}"`)
			process.exit(1)

		} else {
			detectedBaseNames.add(fname)
		}

	})

	const runBasename = path.basename(rawArgs.toRun)

	if (!detectedBaseNames.has(runBasename)) {

		console.error(`error: attempting to run file "${runBasename}" that will not be included in the output script.`)
		process.exit(1)

	}

	return rawArgs

}

compile.preprocess = rawArgs => {

	const encoding = Object.keys(rawArgs).reduce((selected, option) => {

		const value      = rawArgs[option]
		const optionName = option.replace(/^--/, '')

		return constants.supportedEncodings.has(optionName) && value === true
			? optionName
			: selected

	}, constants.defaults.encoding)

	return {
		encoding:   encoding,
		shouldGzip: rawArgs['--gzip'],
		fpaths:     rawArgs['<fpath>'],
		toRun:      rawArgs['--run'],
		version:    rawArgs['--version']
	}

}




module.exports = compile
