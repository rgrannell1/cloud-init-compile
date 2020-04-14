
const constants = require('../commons/constants')

const commons = {
	async:  { },
	errors: { }
}

commons.async.map = (data, fn, callback, acc) => {
	if (data.length === 0) {
		return callback(acc)
	} else {

		fn(data[0], (err, result) => {
			commons.async.map( data.slice(1), fn, callback, (acc || [ ]).concat({err,result}) )
		})

	}
}

commons.errors.fs = (err, fpath) => {
	const handled = {
		[constants.errCodes.noEntry]:  fpath => {
			return `ERROR: could not read from "${fpath}"; does the file exist?\n`
		},
		[constants.errCodes.noAccess]: fpath => {
			return `ERROR: could not read from "${fpath}", as it isn't read-accessible.\n`
		}
	}

	if (err) {
		const message = handled.hasOwnProperty(err.code)
			? handled[err.code](fpath)
			: err.message

		console.error(message)
		process.exit(1)
	}
}

module.exports = commons
