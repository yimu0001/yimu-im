// 消息体的操作事件
import commonAxios from 'ym-bridge-shandianyun';
const BaseUrl = 'https://im.shandian8.com';

// 创建待办
export const createPending = (item) => {
  return commonAxios.request({
    url: BaseUrl + '/group',
    method: 'post',
    data: item,
  });
};

//获取群组信息接口
export const groupInfos = (groupIds) => {
  return commonAxios.request({
    url: BaseUrl + '/groupInfos',
    method: 'get',
    params: {
      groupIds,
    },
  });
};
