/*
 * @文件描述:
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2021-12-23 10:37:04
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2021-12-23 10:37:04
 */
import moment from 'moment';

// 格式化时间尽量用插值表达式，避免import引入的麻烦

/**
 * @功能描述: 格式化时间
 * @参数: date：时间戳number  pattern：格式
 * @返回值:
 */
export const dateFormat = (date, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';

  if (date.length < 12) {
    date = date * 1000;
  }

  return moment(date).format(pattern);
};
