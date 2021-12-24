// 消息体的操作事件
import { CustomUrl } from './constant';
import commonAxios from 'ym-bridge-shandianyun';

// 创建待办
export const createPending = (imRemoteId, waitTaskContent, waitTaskUserIds, waitTaskEndTime) => {
  return commonAxios.request({
    url: CustomUrl + '/news/waitTask',
    method: 'post',
    data: { imRemoteId, waitTaskContent, waitTaskUserIds, waitTaskEndTime },
  });
};

// 完成待办事项
export const completePending = (waitTaskId) => {
  return commonAxios.request({
    url: CustomUrl + '/news/waitTaskFinish',
    method: 'post',
    data: { waitTaskId },
  });
};

// 获取待办列表 status状态 默认0返回所有 1未处理 200完成  keyword关键字 page limit groupId
export const fetchPendingList = (status = 0, keyword, page, limit, groupId) => {
  return commonAxios.request({
    url: CustomUrl + '/news/waitTaskList',
    method: 'get',
    params: { status, keyword, page, limit, groupId },
  });
};
// 获取待办负责人用户列表
export const fetchPendingDirectorList = (groupId) => {
  return commonAxios.request({
    url: CustomUrl + '/news/getWaitTaskUserList',
    method: 'get',
    params: { groupId },
  });
};
