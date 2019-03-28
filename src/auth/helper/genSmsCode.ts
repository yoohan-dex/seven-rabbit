export const genSmsCode = () => {
  const number = Math.random();
  return (number * 10000).toFixed();
};
