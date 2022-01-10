<script>
import Toolbar from './toolbar.vue';
import bus from '@/libs/bus';
export default {
  name: 'lemonMessageImage',
  data() {
    return { readNum: 0, userId: null };
  },
  inheritAttrs: false,
  inject: ['IMUI'],
  components: { Toolbar },
  mounted() {
    this.userId = sessionStorage.getItem('current_userId');

    bus.$on('updateReadNum', (readList, targetId) => {
      if (this.$attrs.message.toContactId === targetId) {
        this.readNum = readList ? Object.keys(readList).length : 0;
      }
    });
  },
  render() {
    const { fromUser } = this.$attrs.message;
    // <img class='content-show img-show' src={props.content} />
    return (
      <lemon-message-basic
        class='lemon-message-image abc'
        props={{ ...this.$attrs }}
        scopedSlots={{
          content: (props) => {
            return (
              <div class='tool-bar-wrapper'>
                {fromUser.id !== this.userId ? (
                  <div
                    class='only-content'
                    style={
                      fromUser.id === this.userId
                        ? 'justify-content: flex-end'
                        : 'justify-content: flex-start'
                    }
                  >
                    <img class='content-show img-show' src={props.content} />
                  </div>
                ) : (
                  <div class='all-infos'>
                    {fromUser.id === this.userId && (
                      <div class='read-num'>
                        <p>{this.readNum}人已读</p>
                      </div>
                    )}
                    <img class='content-show img-show' src={props.content} />
                  </div>
                )}

                <toolbar msgContent={{ ...this.$attrs.message }}></toolbar>
              </div>
            );
          },
        }}
      />
    );
  },
};
</script>

<style lang="less">
.lemon-message.lemon-message-image {
  user-select: none;

  .lemon-message__content {
    border: 2px solid #000;
    font-size: 12px;
    cursor: pointer;
    overflow: visible;
    background: none;
    border: none;

    &::before {
      display: none;
    }
  }
  .tool-bar-wrapper {
    .content-show {
      border-radius: 2px;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.04);
    }
    .tool-bar {
      padding: 3px 0 0 0;
      visibility: hidden;
      .iconfont {
        margin: 0 5px;
        font-size: 16px;
        &:hover {
          color: #0fd547;
        }
      }
    }
    &:hover .tool-bar {
      visibility: visible;
    }
  }
  .tool-bar-wrapper .img-show {
    max-width: 200px;
    height: auto;
  }
}
.all-infos {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  .read-num {
    margin: 2px 5px;
    min-width: 1px;
    max-width: 100px;
    color: #999;
    font-size: 12px;
  }
}
.only-content {
  display: flex;
}
</style>
