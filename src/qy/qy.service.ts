import { Injectable } from '@nestjs/common';
import axios from 'axios';
import uuid from 'uuid';

import {
  QyAccessTokenApi,
  JsTicketApi,
  WeChat,
  QyApiConfigKit,
  QyTagApi,
  QyExContact,
  QyWeChat,
} from 'tnwx';

@Injectable()
export class QyService {
  async getAccessToken() {
    const data = await QyAccessTokenApi.getAccessToken();
    if (data) return data;
  }

  async getSignature(url: string) {
    let appId = process.env.QY_AGENT_ID;
    console.log('jsaijdfijasidjf-----------', appId);
    const timestamp = `${new Date().getTime() / 1000}`;
    let nonceStr = 'jdisjaflsjvjk';
    const signature = await QyWeChat.jssdkSignature(nonceStr, timestamp, url);
    return {
      appId: appId,
      timestamp: timestamp,
      nonceStr: nonceStr,
      signature: signature,
    };
  }

  async getAllTags() {
    return await QyExContact.getCorpTagList();
  }
  async getExTags(gloupName?: string) {
    const res = await QyExContact.getCorpTagList();
    const tagGroupList: any[] = JSON.parse(res).tag_group;
    if (!gloupName) return tagGroupList;
    const gloup = tagGroupList.find(g => g.group_name === gloupName);
    return gloup.tag;
  }
  // async getUser() {
  //   const res = await QyExContact.getFollowUserList();
  //   console.log('res', res);
  //   return res;
  // }

  // async getCustomer() {
  //   const res = await QyExContact.getUserList('YaoFan');
  //   console.log('res', res);
  //   return res;
  // }
}
