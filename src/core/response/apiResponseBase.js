class ApiResponseBase {
	constructor({
		statusCode,
		internalCode,
		message,
		metaData = {},
		succcessRes = true,
	}) {
		this.status = statusCode;
		this.code = internalCode;
		this.message = message;
		if (succcessRes) {
			this.metaData = metaData;
		}
	}

	santilizeData() {
		let clone = { ...this };
		delete clone.status;
		Object.keys(clone).forEach((key) => {
			if (typeof clone[key] === 'object') {
				if (Object.keys(clone[key]).length == 0) {
					delete clone[key];
				}
			} else if (clone[key] === null) {
				delete clone[key];
			}
		});
		return clone;
	}

	send(res) {
		return res.status(this.status).json(this.santilizeData(this));
	}
}

module.exports = { ApiResponseBase };
