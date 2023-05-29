let invalidmsg = '';

export function validateTime(time) {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(time)) {
    invalidmsg = 'Bad time format!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

export function validatePrice(price) {
  const numregex = /^\d+$/;

  if (price !== '' && !numregex.test(price)) {
    invalidmsg = 'Price should be a positive number!';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

export function validateType(type) {
  if (type !== 'ir' && type !== 'r') {
    invalidmsg = 'Bad type was given';
    console.log(invalidmsg);
    return false;
  }
  return true;
}

export function validateTrain(from, to, day, time, price, type) {
  if (from === '' || to === '' || day === '' || time === '' || price === '' || type === '') {
    invalidmsg = 'Empty input field!';
    console.log(invalidmsg);
    return false;
  }
  const days = ['hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat', 'vasárnap'];
  if (!days.includes(day.toLowerCase())) {
    invalidmsg = 'Bad day was given';
    console.log(invalidmsg);
    return false;
  }
  if (!validateType(type) || !validateTime(time) || !validatePrice(price)) return false;

  return true;
}

export function validateSearchData(from, to, minprice, maxprice) {
  if (!validatePrice(minprice) || !validatePrice(maxprice)) return false;
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
