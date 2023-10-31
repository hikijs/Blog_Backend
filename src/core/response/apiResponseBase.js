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
		return clone;
	}

	send(res) {
		return res.status(this.status).json(this.santilizeData(this));
	}
}

module.exports = { ApiResponseBase };
