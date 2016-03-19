
"use strict"





const cloudInitCompile = require('../cloud-init-compile/app/cloud-init-compile')

const temp = require('temp')
const path = require('path')
const fs   = require('fs')




temp.open('clic-', (err, info) => {

	if (err) {
		throw err
	}

	const testContent = [
		'example-content',
		'example-content'
	].join('\n')

	fs.write(info.fd, testContent)
	fs.close(info.fd, err => {

		if (err) {
			throw err
		}

		cloudInitCompile({
			'--gzip':    false,
			'<fpath>':   [
				info.path
			],
			'--run':     info.path,
			'--version': false
		}, (err, cloudInitContent) => {

			if (err) {
				throw err
			}

			if (cloudInitContent.indexOf(testContent) === -1) {
				throw Error('could not find content in output.')
			}

			if (cloudInitContent.indexOf(path.basename(info.path)) === -1) {
				throw Error('could not find path in output.')
			}

		})

	})

})
