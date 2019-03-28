export const random = (l: number) => {
  const r = parseInt((Math.random() * 1000000).toFixed(), 10);
  const n = r % l;
  return n;
};
