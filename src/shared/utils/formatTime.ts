const format = (t: string) => {
  return new Date(parseInt(t, 10))
    .toJSON()
    .replace('T', ' ')
    .replace('Z', '');
};

export { format };
