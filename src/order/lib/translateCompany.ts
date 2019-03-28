export const translateCompany = (str: string) => {
  switch (str) {
    case '顺丰':
      return 'shunfeng';
    case '德邦':
      return 'debangwuliu';
    case '韵达':
      return 'yunda';
    default:
      return 'unknown';
  }
};
