const Joi = require('joi');
const { ValidationSource } = require('../../middelwares/validator');

const userNamePatter =
	/^[a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸ]*$/u;
const AuthenticaseBasicSchema = {
	SIGNUP: {
		source: ValidationSource.BODY,
		schema: Joi.object().keys({
			username: Joi.string()
				.min(8)
				.regex(userNamePatter)
				.max(30)
				.required()
				.messages({
					'string.pattern.base':
						'Username should only contain letters and numbers and spaces',
				}),
			birth: Joi.string().required().isoDate(), //YYYY-MM-DD
			email: Joi.string().required().email(),
			password: Joi.string().required().min(4),
		}),
	},

	PASSWORD: {
		source: [ValidationSource.QUERY, ValidationSource.BODY],
		schema: Joi.object({
			query: Joi.object().keys({
				email: Joi.string().required().email().messages({
					'string.email': 'Please enter a valid email address',
				}),
			}),
			body: Joi.object()
				.keys({
					resetToken: Joi.string().optional(),
					newPassword: Joi.string().required().min(4),
					confirmPassword: Joi.string()
						.valid(Joi.ref('newPassword'))
						.required()
						.min(4),
				})
				.with('newPassword', 'confirmPassword')
				.messages({
					'any.required': 'Please provide newPassword and confirmPassword',
					'any.only': 'confirm Password does not match',
				})
		})
			.xor('query', 'body')
			.required()
			.messages({
				'object.xor': 'Please provide either query or body',
			})
			.messages({
				'object.missing':
					'Please provide either query for unauthenticated user or body for authenticated user',
			}),
	},
};

module.exports = AuthenticaseBasicSchema;
