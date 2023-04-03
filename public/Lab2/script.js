function fact(x) {
  let fx = 1;
  for (let i = 2; i < x; ++i) {
    fx *= i;
  }
  return fx;
}

const f = fact(5);
console.log(f);
