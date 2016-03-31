
"use strict"




const cloudInitCompile = require('../cloud-init-compile/app/cloud-init-compile')





const temp = require('temp')
const path = require('path')
const fs   = require('fs')






const setup = (content, optFn, testCase) => {

	temp.open('clic-', (err, info) => {

		if (err) {
			return testCase(err)
		}

		fs.write(info.fd, content)
		fs.close(info.fd, err => {

			if (err) {
				return testCase(err)
			}

			cloudInitCompile(optFn(info.path), (err, content) => {
				return testCase(err, content, info.path)
			})

		})

	})

}




{

	let testContent = [
		'example-content',
		'example-content'
	].join('\n')

	let opts = fpath => ({
		'--gzip':    false,
		'<fpath>':   [fpath],
		'--run':     fpath,
		'--version': false
	})

	setup(
		testContent, opts, (err, content, fpath) => {

			if (err) {
				throw err
			}

			if (content.indexOf(testContent) === -1) {
				throw Error('could not find content in output.')
			}

			if (content.indexOf(path.basename(fpath)) === -1) {
				throw Error('could not find path in output.')
			}

		}
	)

}
