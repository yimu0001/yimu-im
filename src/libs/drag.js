// 拖拽
export const OnInitDrag = () => {
  // lemon-menu lemon-sidebar__fixed-top lemon-container__title
  $(
    '.lemon-menu, .lemon-sidebar__fixed-top, .lemon-container__title, .enable-drag-area, .lemon-contact-info'
  ).mousedown(function (e) {
    handleDragAll(e, this.className);
    // console.log('开始移动了', this.className);
  });
};
const handleDragAll = (e, className) => {
  e.stopPropagation();
  var thisBlock = $('#mainDialog .el-dialog');
  var drag = $(`.${className}`)[0] || $(`.${className}`);
  var e = e || window.event;

  // 限定有效区域 边距可视区域预留出
  // 弹窗宽高 thisBlock.width(), thisBlock.height())
  // 网页可见区域宽高 document.body.clientWidth, document.body.clientHeight)
  var diff = 200; // 上下最低距离边界
  // 范围: minX, maxX, minY, maxY
  var minX = 0;
  var maxX = document.body.clientWidth - thisBlock.width() - 20;
  var minY = diff - thisBlock.height();
  var maxY = document.body.clientHeight - diff;
  var diffX = undefined;
  var diffY = undefined;

  if (drag.setCapture) {
    drag.setCapture();
  } else {
    e.preventDefault && e.preventDefault();
  }

  document.onmousemove = (e) => {
    var e = e || window.event;
    if (!diffX && !diffX) {
      var nowX = thisBlock.offset().left;
      var nowY = thisBlock.offset().top;
      diffX = e.clientX - nowX;
      diffY = e.clientY - nowY;
    }

    var leftInit = e.clientX - diffX;
    var topInit = e.clientY - diffY;
    const { left, top } = checkPosition(leftInit, topInit, minX, maxX, minY, maxY);

    if (thisBlock.css) {
      thisBlock.css('margin-left', left + 'px');
      thisBlock.css('margin-top', top + 'px');
    }
  };
  document.onmouseup = function (e) {
    this.onmousemove = null;
    this.onmouseup = null;
    if (drag.releaseCapture) {
      drag.releaseCapture();
    }
  };
};

// 限制超出屏幕处理
const checkPosition = (leftInit, topInit, minX, maxX, minY, maxY) => {
  let left = leftInit;
  let top = topInit;
  if (left < minX) {
    left = minX;
  }
  if (left > maxX) {
    left = maxX;
  }
  if (top < minY) {
    top = minY;
  }
  if (top > maxY) {
    top = maxY;
  }

  return { left, top };
};
