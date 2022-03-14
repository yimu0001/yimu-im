/*
 * @文件描述:
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2021-12-23 10:37:04
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-14 15:05:36
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

// lemon-imui：会话列表的群组id为`group_${id}`  融云：会话列表的群组id为id
//  ui那边的id传给融云之前的处理 去掉group_
export const CalcTargetId = (id) => {
  if (!id) return '';

  let targetId = id;
  if (id.includes('group_')) {
    targetId = id.split('_')[1];
  }

  return targetId || '';
};

//定义一个新数组，把老数组中的元素反向添加到新数组中
export const reverseArray = (array) => {
  if (!array || !(array instanceof Array)) {
    return [];
  }

  var newArr = [];
  for (var i = array.length - 1; i >= 0; i--) {
    newArr[newArr.length] = array[i];
  }
  return newArr;
};

// 根据字体大小 引入css文件
export const SetIMTheme = (size) => {
  // 移除旧的节点
  const oldNode = document.querySelector('#mg-service-font-link');
  if (oldNode) {
    oldNode.parentNode.removeChild(document.querySelector('#mg-service-font-link'));
  }

  // 生成新节点，引入css
  const link = document.createElement('link');
  link.id = 'mg-service-font-link';
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = require(`@/assets/theme/${size}.less`);
  document.getElementsByTagName('head')[0].appendChild(link);
};
