<!--
 * @文件描述: 设置
 * @公司: 广电信通
 * @作者: 赵婷婷
 * @Date: 2022-03-09 11:31:19
 * @LastEditors: 赵婷婷
 * @LastEditTime: 2022-03-15 11:14:46
-->
<template>
  <div class="set-page">
    <div class="page-title title-size-text enable-drag-area">设置</div>
    <Form
      ref="setform"
      class="setting-col normal-size-text"
      :label-width="120"
      label-position="right"
      :model="formItem"
    >
      <FormItem label="通知弹出：" prop="allowPop">
        <i-switch class="switch-value" v-model="formItem.allowPop" size="large">
          <span slot="open">开启</span>
          <span slot="close">关闭</span>
        </i-switch>
      </FormItem>
      <FormItem label="字体大小：" prop="sizeType">
        <RadioGroup v-model="formItem.sizeType">
          <Radio label="large">大</Radio>
          <Radio label="middle">中</Radio>
          <Radio label="small">小</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <el-button type="primary" size="small" :loading="saveLoading" @click="confirmSave"
          >保存设置</el-button
        >
        <el-button size="small" @click="cancelSave">取消</el-button>
      </FormItem>
    </Form>

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
import { Button } from 'element-ui';

export default {
  name: 'Settings',
  data() {
    return {
      initForm: {
        allowPop: true,
        sizeType: 'middle',
      },
      formItem: {
        allowPop: true,
        sizeType: 'middle',
      },
      sizeOptions: ['large', 'middle', 'small'],
      completePop: false,
      saveLoading: false,
    };
  },
  components: {
    elButton: Button,
  },
  mounted() {
    let userInfo = sessionStorage.getItem('current_user');
    if (userInfo) {
      this.user = JSON.parse(userInfo);
    }

    this.getSettingInfo();
  },
  methods: {
    getSettingInfo() {
      setTimeout(() => {
        // 模拟接口
        this.initForm = {
          allowPop: true,
          sizeType: 'middle',
        };
        this.formItem = { ...this.initForm };
      }, 1500);
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
    setIMThemeEdit(size) {
      var obj = document.getElementById('mg-service-font-link');
      if (!obj) {
        console.log('新节点');
        // 生成新节点，引入css
        const link = document.createElement('link');
        link.id = 'mg-service-font-link';
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = require(`@/assets/theme/${size}.less`);
        document.getElementsByTagName('head')[0].appendChild(link);
        console.log('link', link);
      } else {
        console.log('旧节点');
        obj.setAttribute('href', require(`@/assets/theme/${size}.less`));
        console.log('obj', obj);
      }
    },
    setDomsStyle() {
      let doms = document.getElementsByClassName('lemon-contact__content');
      console.log('doms', doms.length);
      for (var i in doms) {
        console.log('dom', doms[i].style);
        doms[i].style && (doms[i].style.fontSize = '12px');
      }
    },
    confirmSave() {
      const { allowPop, sizeType } = this.formItem;
      if (!this.sizeOptions.includes(sizeType)) {
        this.$Message.warning('请设置有效的字体大小');
        return;
      }

      this.saveLoading = true;
      setTimeout(() => {
        // TODO 调接口
        this.initForm = { allowPop, sizeType };
        sessionStorage.setItem('themeSize', sizeType);
        this.completePop = true;
        this.saveLoading = false;
      }, 1000);
    },
    cancelSave() {
      this.formItem = { ...this.initForm };
    },
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>

<style lang="less" scoped>
.set-page {
  height: 100%;
  padding: 0;
  box-sizing: border-box;
  background-color: #f2f2f2;

  .page-title {
    padding: 0 20px;
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #000;
    border-bottom: 1px solid #ececec;
  }
  .setting-col {
    padding: 40px 15px;
    font-size: 14px;
    .grey-title {
      height: 40px;
      line-height: 40px;
      color: #999;
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
