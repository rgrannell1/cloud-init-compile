
const constants = {
	shebangs: {
		bash: '#!/usr/bin/env sh'
	},
	cloudInitDelimiter: 'CLOUD_INIT_EOF',
	errCodes: {
		noEntry:  'ENOENT',
		noAccess: 'EACCES'
	},
	encodings: {
		utf8:   'utf-8',
		base64: 'base64'
	},
	supportedEncodings: new Set([
		'hex',
		'utf8',
		'utf-8',
		'ascii',
		'binary',
		'base64',
		'ucs2',
		'ucs-2',
		'utf16le',
		'utf-16le'
	]),
	defaults: {
		encoding: 'base64',
		workingDirectory: '/usr'
	},
	package: require('../../package')
}

module.exports = constants
