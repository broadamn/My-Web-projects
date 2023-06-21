import Joi from 'joi';

let invalidmsg = '';

export function validateTime(dtime, atime) {
  const timeSchema = Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.pattern.base': 'Bad time format!',
      'any.required': 'Time is required!',
    });

  const dtimeValidation = timeSchema.validate(dtime);
  const atimeValidation = timeSchema.validate(atime);

  if (dtimeValidation.error || atimeValidation.error) {
    const errorMessage = dtimeValidation.error
      ? dtimeValidation.error.details[0].message
      : atimeValidation.error.details[0].message;
    console.log(errorMessage);
    return false;
  }
  return true;
}

export function validatePrice(price) {
  const priceSchema = Joi.string().regex(/^\d+$/).allow('').messages({
    'string.pattern.base': 'Price should be a positive number!',
  });

  const { error } = priceSchema.validate(price);
  if (error) {
    invalidmsg = error.details[0].message;
    console.log(invalidmsg);
    return false;
  }
  return true;
}

export function validateType(type) {
  const schema = Joi.string().valid('ir', 'r', 'any');
  const { error } = schema.validate(type);

  if (error) {
    const invalidMsg = 'Bad type was given';
    console.log(invalidMsg);
    return false;
  }

  return true;
}

export function validateTrain(from, to, day, dtime, atime, price, type) {
  if (from === '' || to === '' || day === '' || dtime === '' || atime === '' || price === '' || type === '') {
    invalidmsg = 'Empty input field!';
    console.log(invalidmsg);
    return false;
  }
  const days = ['hetfo', 'kedd', 'szerda', 'csutortok', 'pentek', 'szombat', 'vasarnap'];
  if (!days.includes(day.toLowerCase())) {
    invalidmsg = 'Bad day was given';
    console.log(invalidmsg);
    return false;
  }
  if (!validateType(type) || !validateTime(dtime, atime) || !validatePrice(price)) return false;

  return true;
}

export function validateSearchData(from, to, minprice, maxprice, type) {
  if (!validatePrice(minprice) || !validatePrice(maxprice) || !validateType(type)) return false;
  const maxp = parseInt(maxprice, 10);
  const minp = parseInt(minprice, 10);
  if (maxp < minp) {
    invalidmsg = 'Minimum price should be lower than maximum price!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

export function validateId(id) {
  const numregex = /^\d+$/;

  if (!numregex.test(id)) {
    invalidmsg = 'Incorrect ID was given!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

export function getInvalidMessage() {
  return invalidmsg;
}
