import axios from 'axios';

const sharedParams = {
  accessToken: '',
  expireIn: 0,
  updateTime: 0,
};

export const getAccessToken = async () => {
  const { accessToken, expireIn, updateTime } = sharedParams;
  const now = new Date().getSeconds();
  if (!accessToken || now - updateTime - expireIn < 0) {
    try {
      const res = await getAccessTokenQuery();
      sharedParams.accessToken = res.accessToken;
      sharedParams.expireIn = (res.expireIn - 200) * 1000;
      sharedParams.updateTime = new Date().getSeconds();
      return res.accessToken;
    } catch (err) {
      return err;
    }
  }

  return accessToken;
};

const getAccessTokenQuery = async () => {
  const { WX_APPID, WX_APPSECRET } = process.env;
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX_APPID}&secret=${WX_APPSECRET}`;
  let tryTime = 0;
  const { data } = await axios.get(url);
  if (data.access_token) {
    console.log('data', data);
    return {
      accessToken: data.access_token,
      expireIn: parseInt(data.expires_in, 10),
    };
  } else if (!data.access_token && tryTime < 3) {
    tryTime += 1;
    return await getAccessTokenQuery();
  }
  console.log('data', data);
  throw new Error('获取access_token失败');
};
