
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const commons = require('../commons/commons')
const constants = require('../commons/constants')

/**
 * Given the files & the script to run, generate the
 * cloud-init script.
 *
 * @param {*} files a list of file paths
 * @param {*} toRun the file to run
 *
 * @returns {string} a cloud-init document.
 */
const createCloudInitScript = (files, toRun) => {
	// -- generate HERE documents for each file, using a
	// -- constant delimiter for each file.
	const hereDocuments = files.map(content => {
		const filename = path.basename(content.fpath)

		return `cat << ${constants.cloudInitDelimiter} > "${filename}"` + '\n' +
			content.content + '\n' +
			constants.cloudInitDelimiter
	})

	const runName = path.basename(toRun)

	return [constants.shebangs.bash]
		.concat(hereDocuments)
		// -- make the runneable script executable.
		.concat(`chmod +x ${runName} && ${runName}`)
		.join('\n')
}

/**
 * gzip the cloud-init script.
 *
 * @param {string} content the content to zip.
 * @param {string} encoding the string encoding to export.
 *
 * @returns {Promise<string>} the cloud-init script
 */
const gzipContent = async (content, encoding) => {
	return new Promise((resolve, reject) => {
		zlib.gzip(
			new Buffer(content, constants.encodings.utf8),
			{
				level: zlib.Z_BEST_COMPRESSION
			},
			// -- encode the zipped cloud-init script.
			(err, result) => {
				err
					? reject(err)
					: resolve(result.toString(encoding))
			}
		)
	})
}

/**
 * Bundle the files and construct a cloud-init script
 *
 * @param {Array<string>} fpaths
 * @param {Object} opts
 *
 * @returns {string} return a cloud-init script
 */
const bundleContent = async (fpaths, opts) => {

	const results = []

	for (const fpath of fpaths) {
		try {
			const content = await fs.readFile(fpath)
			results.push({
				fpath,
				content: content.toString()
			})
		} catch (err) {
			// -- TODO handle error
		}
	}

	const cloudInitScript = createCloudInitScript(results, opts.toRun)

	return opts.shouldGzip
		? gzipContent(cloudInitScript, opts.encoding)
		: cloudInitScript
}

module.exports = bundleContent
