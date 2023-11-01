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
};

module.exports = AuthenticaseBasicSchema;
