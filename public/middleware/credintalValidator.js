import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('user', 'admin').required(),
});

export function validateLoginData(req, res, next) {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res.render('error.ejs', { message: 'Hibás adatok', problem: error });
  } else {
    next();
  }
}

const registrationSchema = Joi.object({
  username: Joi.string().required(),
  password1: Joi.string().required(),
  password2: Joi.string().required().valid(Joi.ref('password1')).messages({
    'any.only': 'Kérem ugyanazt a jelszót adja meg',
  }),
});

export function validateRegistrationData(req, res, next) {
  const { error } = registrationSchema.validate(req.body);

  if (error) {
    const errorMessage = error.details[0].message;
    res.render('login.ejs', { problem: errorMessage });
  } else {
    next();
  }
}

export function validatePasswords(req, res, next) {
  const { oldpassword, newpassword1, newpassword2 } = req.body;

  const schema = Joi.object({
    oldpassword: Joi.string().required(),
    newpassword1: Joi.string().required(),
    newpassword2: Joi.string().valid(Joi.ref('newpassword1')).required().messages({
      'any.only': 'A két jelszó nem egyezik!',
    }),
  });

  const { error } = schema.validate({ oldpassword, newpassword1, newpassword2 });

  if (error) {
    const errorMessage = error.details[0].message;
    res.status(400).render('resetpasswd.ejs', { problem: errorMessage });
  } else {
    next();
  }
}
