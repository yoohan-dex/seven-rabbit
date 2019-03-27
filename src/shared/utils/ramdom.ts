export const random = (l: number) => {
  const r = parseInt(Math.random().toFixed(), 10);
  if (r < 1 || r > l) return random(l);
  return r;
};
