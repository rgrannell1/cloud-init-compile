#!/usr/bin/env node

"use strict"

const constants = require('../commons/constants')

const encodings = Array.from(constants.supportedEncodings)
	.map(encoding => `--${encoding}`)

const encodingOptions = encodings
	.map(encoding => `	${encoding}`)

const doc = `
Name:
	clic (cloud-init-compile) — compile multiple scripts into a single cloud-init friendly script.

Author:
	${constants.package.author}

Usage:
	clic (-r FPATH | --run FPATH) [--working-directory] [--] <fpath>...
	clic (-r FPATH | --run FPATH) (-z|--gzip) [--working-directory] [${ encodings.join('|') }] [--] <fpath>...
	clic (-h | --help | --version)

Description:

	clic bundles multiple scripts into a single Bash script that can be executed by Cloud-Init. It:

	* Embeds each file into the script as a here-document.
	* Writes each file to its filename on the target machine.
	* Executes a single supplied filename, adding executable permissions if required.

Notes:

	* All files are assumed to be UTF-8 encoded.
	* The highest level of compression is used when gzip is enabled.

Options:
  --working-directory      The working directory to use. By default, ${constants.defaults.workingDirectory} is used.
	-r FPATH, --run FPATH    The path or basename of the script to execute. This script must be
	                         included as a path argument too (see below).
	-z, --gzip               Gzip-compress the cloud-init script. This is helpful, as
	                         Cloud-Init scripts are generally limited to 16kb.  If gzip is enabled, you may specify one of the
	                         following encodings for the output text. By default, ${constants.defaults.encoding} is used:
` +

encodingOptions.join('\n') +

`
	-h, --help               Display this documentation.

Arguments:
	<fpath>...               The relative file paths to load content from. If a file fails to load, an error is shown but an
	                         output script will be generated from the remaining files.

Version:
	v${constants.package.version}
`

const docopt = require('docopt').docopt
const cloudInitCompile = require('../app/cloud-init-compile')
const args = docopt(doc)

const main = async () => {
	try {
		const content = await cloudInitCompile.cli(args)
		console.log(content)
	} catch (err) {
		throw err
	}
}

main()
