export function encrypt(value) {
  const encrypt = value.length - 4;
  let val = "";
  for (let i = 0; i <= encrypt - 1; i++) {
    val = val + "*";
  }

  return val + value.slice(encrypt, value.length);
}
