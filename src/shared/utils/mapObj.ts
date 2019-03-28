/**
 * map object that have same key with lodash to an object have a single key
 */
export const mapObj = (willMapData: object | object[], alias: string) => {
  if (Array.isArray(willMapData)) {
    return willMapData.map(obj => mapObj(obj, alias));
  }
  const newObj = { ...willMapData, [alias]: {} };
  Object.keys(willMapData).forEach(key => {
    if (key.indexOf(`${alias}_`) !== -1) {
      const newKey = key.split('_')[1];
      newObj[alias][newKey] = willMapData[key];
      delete newObj[key];
    }
  });

  return newObj;
};
