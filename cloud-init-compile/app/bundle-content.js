
const fs = require('fs').promises
const path = require('path')
const zlib = require('zlib')
const tar = require('tar')
const btoa = require('btoa')
const randomstring = require('randomstring')
const streamToPromise = require('stream-to-promise')

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
const createCloudInitScript = (files, toRun, workingDirectory) => {
	// -- generate HERE documents for each file, using a
	// -- constant delimiter for each file.
	const hereDocuments = files.map(createHereDocument)

	const runName = path.basename(toRun)

	return [constants.shebangs.bash]
		.concat(`DIR=${workingDirectory}`)
		.concat(hereDocuments)
		// -- make the runneable script executable.
		.concat(`chmod +x $DIR/${runName} && $DIR/${runName}\n`)
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
 * Create user-readable file errors.
 *
 * @param {Error} err
 */
const handleReadError = err => {
	if (err.code === constants.errCodes.noEntry) {
		throw errors.noEntry(`could not read from "${fpath}"; does the file exist?\n`, 'noEntry')
	} else if (err.code === constants.errCodes.noAccess) {
		throw errors.noAccess(`could not read from "${fpath}", as it isn't read-accessible\n`, 'noAccess')
	} else {
		throw err
	}
}

/**
 *
 * @param {*} fpath
 */
const toHereDocument = async fpath => {
	const stat = await fs.lstat(fpath)
	const basename = path.basename(fpath)

	if (stat.isDirectory()) {
		return toHereDocument.folder(fpath)
	} else if (stat.isFile()) {
		return toHereDocument.file(fpath)
	} else {
		throw errors.invalidFileType(`could not add "${fpath}" to cloud-init script.`)
	}
}

toHereDocument.file = async fpath => {
	const basename = path.basename(fpath)

	const content = await fs.readFile(fpath)

	return `\ncat << ${constants.cloudInitDelimiter} > "$DIR/${basename}.base64"` + '\n' +
		btoa(content.toString()) + '\n' +
		constants.cloudInitDelimiter + '\n' +
		`base64 -d $DIR/${basename}.base64 > $DIR/${basename}\n`
}

toHereDocument.folder = async fpath => {
	const basename = path.basename(fpath)

	const stream = tar.create({
		strict: true,
		gzip: true
	}, [fpath])

	const zipped = await streamToPromise(stream)
	const id = randomstring.generate()

	return `cat << ${constants.cloudInitDelimiter} > "$DIR/${id}_${basename}.base64"` + '\n' +
		btoa(zipped) + '\n' +
		constants.cloudInitDelimiter + '\n' +
		`base64 -d $DIR/${id}_${basename}.base64 > $DIR/${id}_zip_${basename}\n\n` +
		`tar -xzf "$DIR/${id}_zip_${basename}" -C "$DIR"\n`
}

const newCreateScript = async (fpaths, toRun, workingDirectory) => {
	const hereDocuments = fpaths.map(fpath => {
		return toHereDocument(fpath)
	})

	const docs = await Promise.all(hereDocuments)

	const runName = path.basename(toRun)

	return [constants.shebangs.bash]
		.concat('set -e')
		.concat(`DIR=${workingDirectory}`)
		.concat(docs)
		// -- make the runneable script executable.
		.concat(`chmod +x $DIR/${runName} && $DIR/${runName}\n`)
		.join('\n')
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
	const cloudInitScript = await newCreateScript(fpaths, opts.toRun, opts.workingDirectory)

	return opts.shouldGzip
		? gzipContent(cloudInitScript, opts.encoding)
		: cloudInitScript
}

module.exports = bundleContent
