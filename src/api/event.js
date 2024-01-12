// 消息体的操作事件
import { CustomUrl } from './constant';
import commonAxios from 'ym-bridge-shandianyun';
import { CalcTargetId } from '@/libs/tools';

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

// 获取待办列表 status状态 默认0返回所有 1未处理 200完成  keyword关键字 page per_page groupId
export const fetchPendingList = (isGroup = false, id, page = 1, type, status = 0, keyword) => {
  // 单聊userId 群聊groupId
  let params = { page, type, status, keyword, per_page: 20 };
  if (isGroup) {
    params.groupId = CalcTargetId(id);
  } else {
    params.userId = id;
  }

  return commonAxios.request({
    url: CustomUrl + '/news/waitTaskList',
    method: 'get',
    params,
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
// 获取标记列表
export const fetchMarkList = (isGroup = false, id, page = 1, type, keyword) => {
  // 单聊userId 群聊groupId
  let params = { page, type, keyword, per_page: 20 };
  if (isGroup) {
    params.groupId = CalcTargetId(id);
  } else {
    params.userId = id;
  }

  return commonAxios.request({
    url: CustomUrl + '/news/markList',
    method: 'get',
    params,
  });
};
