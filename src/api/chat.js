/*
 * @文件描述:
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2021-12-22 16:12:19
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2021-12-22 16:50:03
 */
import { BaseUrl, CustomUrl, BIG_PAGE_SIZE } from './constant';
import commonAxios from 'ym-bridge-shandianyun';

// 数据统计
// 个人统计 message_amount 消息数  mark_amount 标记数  to_do_amount 待完成数  finish_amount 完成数
export const fetchSingleStats = (page, org_id, type, keyword, order_by, sort) => {
  return commonAxios.request({
    url: BaseUrl + '/statistical/person',
    method: 'get',
    params: {
      page,
      per_page: BIG_PAGE_SIZE,
      org_id,
      type, // 1 客服；2 管理员；3 普通用户；
      keyword, // 搜索关键字
      order_by, // 排序字段；message_amount 等
      sort, // asc；desc
    },
  });
};
// 群组统计 message_amount 消息数  person_amount 人数  mark_amount 标记数  to_do_amount 待完成数  finish_amount 完成数
export const fetchGroupStats = (page, org_id, keyword, order_by, sort) => {
  return commonAxios.request({
    url: BaseUrl + '/statistical/group',
    method: 'get',
    params: {
      page,
      per_page: BIG_PAGE_SIZE,
      org_id,
      keyword, // 搜索关键字
      order_by, // 排序字段；message_amount 等
      sort, // asc；desc
    },
  });
};

// 获取客服模块侧边栏配置
export const fetchCustomConfig = () => {
  return commonAxios.request({
    url: BaseUrl + '/module/side-options',
    method: 'get',
  });
};

// 消息上下文 offset 	默认5	前后分别多少条
export const fetchMessageContext = (id, offset) => {
  return commonAxios.request({
    url: BaseUrl + '/message-history/message/' + id + '/around',
    method: 'get',
    params: { offset },
  });
};

// 消息历史滚动加载 offset 	默认5	前后分别多少条
export const fetchMessageHistory = (id, offset) => {
  return commonAxios.request({
    url: BaseUrl + '/message-history/message/' + id + '/after',
    method: 'get',
    params: { offset },
  });
};
