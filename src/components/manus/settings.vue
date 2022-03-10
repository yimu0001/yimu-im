<!--
 * @文件描述: 设置
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-03-09 11:31:19
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-10 17:38:25
-->
<template>
  <div class="set-page">
    <div class="setting-col">
      <div class="grey-title">消息通知</div>
      <div class="set-line">
        <p class="title">通知弹出：</p>
        <i-switch class="switch-value" v-model="noticePop" size="large">
          <span slot="open">开启</span>
          <span slot="close">关闭</span>
        </i-switch>
      </div>

      <div class="grey-title">字体设置</div>
      <div class="set-line">
        <p class="title">字体大小：</p>
        <RadioGroup v-model="sizeType">
          <Radio label="large">大</Radio>
          <Radio label="middle">中</Radio>
          <Radio label="small">小</Radio>
        </RadioGroup>
      </div>
    </div>

    <Modal
      v-model="completePop"
      class="modal-his"
      title="提示"
      width="400"
      :z-index="2002"
      ok-text="立即刷新"
      cancel-text="稍后再说"
      @on-ok="reloadPage"
      transfer
    >
      <p class="tips">字体大小设置成功，刷新页面后生效</p>
    </Modal>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      // formItem: { noticePop: false },
      noticePop: false,
      sizeType: 'middle',
      sizeOptions: ['large', 'middle', 'small'],
      completePop: false,
    };
  },
  watch: {
    sizeType(size) {
      if (!this.sizeOptions.includes(size)) {
        this.$Message.warning('请设置有效的字体大小');
        return;
      }

      this.saveTextSize(size);
      // this.setTheme(size);
    },
  },
  mounted() {
    let userInfo = sessionStorage.getItem('current_user');
    if (userInfo) {
      this.user = JSON.parse(userInfo);
    }
  },
  methods: {
    saveTextSize(size) {
      // TODO 调接口
      sessionStorage.setItem('themeSize', size);
      this.completePop = true;
    },
    reloadPage() {
      window.location.reload();
    },
    // 设置字体大小 size: large|middle|small
    setTheme(size) {
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
      link.href = require(`@/assets/theme/${size}.css`);
      document.getElementsByTagName('head')[0].appendChild(link);
    },
  },
};
</script>

<style lang="less" scoped>
.set-page {
  height: 100%;
  padding: 5px 15px 0;
  box-sizing: border-box;
  background-color: #f2f2f2;
  font-size: 14px;

  .setting-col {
    padding: 20px;
    .grey-title {
      height: 40px;
      line-height: 40px;
      color: #999;
      font-size: 13px;
    }
    .set-line {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .title {
        width: 100px;
        text-align: right;
      }
      .switch-value {
        margin: 0 20px;
        width: 57px;
      }
    }
  }
}
</style>
