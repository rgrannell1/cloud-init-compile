
"use strict"




const fs        = require('fs')
const path      = require('path')
const zlib      = require('zlib')

const commons   = require('../commons/commons')
const constants = require('../commons/constants')





const createCloudInitScript = (files, toRun) => {

	const hereDocuments = files.map(content => {

		const filename = path.basename(content.fpath)

		return `cat << ${constants.cloudInitDelimiter} > "${filename}"` + '\n' +
			content.content                                             + '\n' +
			constants.cloudInitDelimiter

	})

	const runName = path.basename(toRun)

	return [constants.shebangs.bash]
		.concat(hereDocuments)
		.concat(
			`chmod +x ${runName} && ${runName}`)
		.join('\n')

}





const gzipContent = (content, encoding, callback) => {

	zlib.gzip(
		new Buffer(content, constants.encodings.utf8),
		{
			level: zlib.Z_BEST_COMPRESSION
		},
		(err, result) => {
			callback(null, result.toString(encoding))
		}
	)

}




const bundleContent = (fpaths, opts, callback) => {

	commons.async.map(
		fpaths,
		(fpath, fsCallback) => {

			fs.readFile(fpath, (err, content) => {
				fsCallback(err, {fpath, content})
			})

		}, results => {

			results.forEach(result => {

				if (result.err) {
					return commons.errors.fs(result.err, result.result.fpath)
				}

			})

			const cloudInitScript = createCloudInitScript( results.map(result => {

				return {
					fpath:   result.result.fpath,
					content: result.result.content.toString( )
				}

			}), opts.toRun)

			opts.shouldGzip
				? gzipContent(cloudInitScript, opts.encoding, callback)
				: callback(null, cloudInitScript)

		}
	)

}





module.exports = bundleContent