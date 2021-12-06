const defaultCharset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const createRandomString = (
  size: number,
  {
    charset = defaultCharset,
    random = Math.random,
  }: { charset?: string; random?: () => number } = {}
) => {
  let str = "";
  for (let i = 0, sl = charset.length; i < size; i++) {
    str += charset[Math.floor(random() * sl)];
  }
  return str;
};

export default createRandomString;
