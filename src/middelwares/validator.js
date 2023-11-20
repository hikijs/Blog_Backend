const { BadRequestError } = require('../core/error.response');

const ValidationSource = {
	BODY: 'body',
	HEADER: 'headers',
	QUERY: 'query',
	PARAM: 'params',
	COOKIES: 'cookies',
};

const Validator = (template) => {
	return (req, res, next) => {
		try {
			let options = {};
			const { source, schema } = template;
			if (source == ValidationSource.HEADER) {
				options = { allowUnknown: true };
			}
			const { error } = schema.validate(req[source], options);

			if (!error) return next(); // pass Validator

			const { details } = error;
			const message = details
				.map((i) => i.message.replace(/['"]+/g, ''))
				.join(',');
			console.log(error);
			// Go to Error Hanlding Logic
			next(
				new BadRequestError({
					message,
				})
			);
		} catch (error) {
			next(error);
		}
	};
};
module.exports = Validator;
module.exports.ValidationSource = ValidationSource;
