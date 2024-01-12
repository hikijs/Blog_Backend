/* eslint-disable indent */
const { BadRequestError } = require('../core/error.response');

const ValidationSource = {
	BODY: 'body',
	HEADER: 'headers',
	QUERY: 'query',
	PARAM: 'params',
	COOKIES: 'cookies',
	FLEX: 'flex',
};

const Validator = (template) => {
	return (req, res, next) => {
		try {
			let options = {};
			const { schema } = template;
			let source = template.source;
			if(typeof source !== 'string')
			{
				source = ValidationSource.FLEX;
			}

			if (source == ValidationSource.HEADER) {
				options = { allowUnknown: true };
			}

			// eslint-disable-next-line no-inner-declarations
			function sourceFex(req, sources) {
				let result = {};
				for(let source of sources)
				{
					if(!(Object.keys(req[source]).length == 0))
					{
						result[source] = req[source];
					}
				}
				console.log(result);
				return result;
			}

			const { error } = schema.validate(
				source != ValidationSource.FLEX? req[source] : 
				sourceFex(req, template.source),
				options);
			// pass validator if there is no error
			if (!error) return next();
			const { details } = error;
			const message = details
				.map((i) => i.message.replace(/['"]+/g, ''))
				.join(',');
			// console.log(error);
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
