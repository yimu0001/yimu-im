<template>
  <div class="mark-box">
    <div class="common-drawer-title">
      <p class="title">重要标记</p>
      <div class="close-btn" @click="closePop">
        <i class="iconfont icon-guanbi" title="关闭"></i>
      </div>
    </div>
    <div class="mark-main">
      <el-tabs v-model="activeMarkKey">
        <el-tab-pane label="我的" name="my"></el-tab-pane>
        <el-tab-pane label="所有" name="all"></el-tab-pane>
      </el-tabs>
      <div class="list-block">
        <div class="filter">
          <Input
            v-model="markKeyword"
            placeholder="请输入内容"
            style="width: 300px"
            search
            clearable
          />
        </div>
        <div class="mark-list narrow-scroll-bar">
          <div class="mark-item" v-for="item in markList" :key="item.id">
            <div class="top-user">{{ item.markUserName }}</div>
            <!-- <p class="msg-content">{{ item.newsContent }}</p> -->

            <p v-if="item.type === 'text'" class="msg-content">{{ item.newsContent.content }}</p>
            <img
              v-if="item.type === 'image'"
              class="content-img"
              :src="item.newsContent.content"
              alt=""
            />
            <div
              v-if="item.type === 'file'"
              class="content-file"
              title="点击下载"
              @click="downloadFile(item.newsContent.fileUrl)"
            >
              <div class="content-file__inner">
                <p class="content-file__name">{{ item.newsContent.name }}</p>
                <p class="content-file__byte">{{ computeFileSize(item.newsContent.size) }}</p>
              </div>
              <div class="content-file__sfx">
                <i class="lemon-icon-attah" />
              </div>
            </div>

            <div class="send-user">
              <p class="user">来自：{{ item.newsUserName }}</p>
              <p class="time">{{ item.pushTime }}</p>
              <i class="iconfont icon-jinru" title="查看" @click="checkHistory(item)"></i>
            </div>
          </div>
          <infinite-loading @infinite="infiniteHandler" :distance="200" :identifier="identifier">
            <span slot="no-more" class="gray-text">到底啦</span>
            <span slot="no-results" class="gray-text">
              {{ finished && markList.length > 0 ? '到底啦' : '暂无数据' }}
            </span>
          </infinite-loading>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InfiniteLoading from 'vue-infinite-loading';
import { Button, Checkbox, Tabs, TabPane } from 'element-ui';
import { Input } from 'view-design';
import { fetchMarkList } from '@/api/event';

import bus from '@/libs/bus';

const TYPE_MSG_OBJ = {
  'RC:ReferenceMsg': 'text',
  'RC:TxtMsg': 'text',
  'RC:ImgMsg': 'image',
  'RC:FileMsg': 'file',
  'RC:InfoNtf': 'event',
};

export default {
  name: 'MarkDrawer',
  components: {
    elButton: Button,
    elCheckbox: Checkbox,
    elTabs: Tabs,
    elTabPane: TabPane,
    'infinite-loading': InfiniteLoading,
    Input,
  },
  data() {
    return {
      activeMarkKey: 'my',
      markKeyword: '',
      markList: [],
      page: 1,
      finished: false,
    };
  },
  props: {
    contact: {
      type: Object,
    },
    closeMethod: {
      type: Function,
      default: () => {},
    },
    openHistory: {
      type: Function,
      default: () => {},
    },
  },
  watch: {
    'contact.id'(id) {
      this.activeMarkKey = 'my';
      this.refreshParam();
    },
    activeMarkKey(key) {
      if (key) {
        this.markKeyword = '';
        this.refreshParam();
      }
    },
    markKeyword() {
      this.refreshParam();
      this.$nextTick(this.getMarkList);
    },
  },
  computed: {
    identifier() {
      return this.activeMarkKey + this.contact.id;
    },
  },

  mounted() {
    bus.$on('refreshDrawerData_1', () => {
      console.log('refreshDrawerData_1');
      this.refreshParam();
      this.$nextTick(this.getMarkList);
    });
  },
  beforeDestroy() {
    bus.$off('refreshDrawerData_1');
  },
  methods: {
    closePop() {
      this.closeMethod();
    },
    computeFileSize(byte) {
      let str = byte;
      let unit = 'B';
      if (byte < 1024) {
        str = byte;
        unit = 'B';
      } else if (byte >= 1024 && byte < 1024 * 1024) {
        str = (byte / 1024).toFixed(2);
        unit = 'K';
      } else if (byte >= 1024 * 1024) {
        str = (byte / (1024 * 1024)).toFixed(2);
        unit = 'M';
      }
      str = str.replace('.00', '');

      return str + unit;
    },
    downloadFile(url) {
      window.open(url);
    },
    refreshParam() {
      this.finished = false;
      this.page = 1;
      this.markList = [];
    },
    getMarkList(cb) {
      let pageNow = this.page;
      let type = this.activeMarkKey === 'my' ? 'my' : '';
      fetchMarkList(this.contact.isGroup, this.contact.id, this.page, type, this.markKeyword).then(
        (res) => {
          console.log('接口获取已标记列表', res.data);
          if (res.status === 200) {
            const { list, num, pages } = res.data.data;
            let info = list.map((item) => ({
              ...item,
              type: TYPE_MSG_OBJ[item.imType] || 'text',
            }));

            if (pageNow === 1) {
              this.markList = info;
            } else {
              this.markList = this.markList.concat(info);
            }

            if (pageNow >= pages) {
              this.page = pages;
              this.finished = true;
            } else {
              this.page = pageNow + 1;
            }
          } else {
            this.$Message.error(res.data.msg);
          }

          cb && cb();
        }
      );
    },

    infiniteHandler($state) {
      if (this.finished) {
        return false;
      }

      this.getMarkList(() => {
        this.finished ? $state.complete() : $state.loaded();
      });
    },
    checkHistory(item) {
      this.openHistory(item);
    },
  },
};
</script>

<style lang="less" scoped>
// 重要标记
.mark-box {
  height: 100%;
  background-color: #f2f2f2;

  .common-drawer-title {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    .title {
      font-size: 14px;
      color: #000;
    }
    .close-btn {
      cursor: pointer;
      font-size: 16px;
      color: #999;
    }
  }
  .mark-main {
    padding: 15px 0 15px 20px;
    background: #f2f2f2;
    box-sizing: border-box;
    .mark-list {
      margin: 10px 0;
      padding-bottom: 40px;
      overflow-y: scroll;
      height: 367px;
      .mark-item {
        margin: 10px 0;
        padding: 5px 15px;
        border: 1px solid #ececec;
        background: #fff;
        border-radius: 4px;
        font-size: 14px;
        line-height: 30px;
        .top-user {
          text-align: right;
          color: #999;
        }
        // 消息体样式
        .msg-content {
          padding: 4px 0;
          line-height: 20px;
          color: #333;
        }
        .content-img {
          width: 60px;
          height: 60px;
        }
        .content-file {
          display: flex;
          cursor: pointer;
          width: 200px;
          background: #fff;
          padding: 12px 18px;
          color: #666;
          border: 1px solid #ececec;
          border-radius: 4px;
          .content-file__inner {
            -webkit-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
            .content-file__name {
              font-size: 14px;
            }
            .content-file__byte {
              font-size: 12px;
              color: #aaa;
            }
          }
          .content-file__sfx {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 34px;
            color: #ccc;
          }
        }

        .send-user {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .user {
            margin-right: 20px;
            font-size: 12px;
            color: #666;
          }
          .time {
            color: #999;
            font-size: 12px;
          }
          .icon-jinru {
            padding: 0 10px;
            cursor: pointer;
            font-size: 18px;
            color: #999;
          }
        }
      }
    }
  }
}
</style>
