import BScroll from 'better-scroll';
import EventEmitter from '../util/eventEmitter';
import { extend } from '../util/lang';
import { createDom, addEvent, addClass, removeClass } from '../util/dom';
import pickerTemplate from './picker.handlebars';
import pickerCheckboxTemplate from './picker.checkbox.handlebars';
import itemTemplate from './item.handlebars';
import './picker.styl';
$.fn.extend({
  animateCss: function (animationName, callback) {
    var animationEnd = (function (el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd'
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName).one(animationEnd, function () {
      $(this).removeClass('animated ' + animationName);

      if (typeof callback === 'function') callback();
    });

    return this;
  }
});

export default class Picker extends EventEmitter {
  constructor(options) {
    super();

    this.options = {
      data: [],
      title: '',
      selectedIndex: null,
      showCls: 'show'
    };
    extend(this.options, options);
    this.data = this.options.data;

    if (this.options.el) {
      this.pickerEl = createDom(
        pickerCheckboxTemplate({
          data: this.data
        })
      );
    } else {
      this.pickerEl = createDom(
        pickerTemplate({
          data: this.data,
          title: this.options.title
        })
      );
    }

    document.body.appendChild(this.pickerEl);

    this.maskEl = this.pickerEl.getElementsByClassName('mask-hook')[0];
    this.wheelEl = this.pickerEl.getElementsByClassName('wheel-hook');
    this.panelEl = this.pickerEl.getElementsByClassName('panel-hook')[0];
    this.confirmEl = this.pickerEl.getElementsByClassName('confirm-hook')[0];
    this.cancelEl = this.pickerEl.getElementsByClassName('cancel-hook')[0];
    this.scrollEl = this.pickerEl.getElementsByClassName('wheel-scroll-hook');

    this._init();
  }

  _init() {
    this.selectedIndex = [];
    this.selectedVal = [];
    this._bindEvent();
    if (this.options.el) {
      $('.picker-checkbox-panel')
        .find('li')
        .eq(this.options.selectedIndex)
        .addClass('checked');
      $.fn.extend({
        animateCss: function (animationName, callback) {
          var animationEnd = (function (el) {
            var animations = {
              animation: 'animationend',
              OAnimation: 'oAnimationEnd',
              MozAnimation: 'mozAnimationEnd',
              WebkitAnimation: 'webkitAnimationEnd'
            };

            for (var t in animations) {
              if (el.style[t] !== undefined) {
                return animations[t];
              }
            }
          })(document.createElement('div'));

          this.addClass('animated ' + animationName).one(
            animationEnd,
            function () {
              $(this).removeClass('animated ' + animationName);

              if (typeof callback === 'function') callback();
            }
          );

          return this;
        }
      });

      return;
    }
    if (this.options.selectedIndex) {
      this.selectedIndex = this.options.selectedIndex;
    } else {
      for (let i = 0; i < this.data.length; i++) {
        this.selectedIndex[i] = 0;
      }
    }
  }

  _bindEvent() {
    const self = this;

    addEvent(this.pickerEl, 'touchmove', (e) => {
      e.preventDefault();
    });
    $('body').on('click', function (e) {
      self.hide();
    });
    if (this.options.el) {
      $('.picker-checkbox-panel')
        .find('li')
        .on('click', function (e) {
          e.stopPropagation();
          $(this)
            .addClass('checked')
            .siblings()
            .not(this)
            .removeClass('checked');
          self.hide();
          self.trigger(
            'picker.select',
            $(this).attr('data-val'),
            $('.picker-checkbox-panel').find('li').index(this)
          );
        });

      return;
    }
    addEvent(this.confirmEl, 'click', () => {
      this.hide();
      let changed = false;
      for (let i = 0; i < this.data.length; i++) {
        let index = this.wheels[i].getSelectedIndex();
        this.selectedIndex[i] = index;

        let value = null;
        if (this.data[i].length) {
          value = this.data[i][index].value;
        }
        if (this.selectedVal[i] !== value) {
          changed = true;
        }
        this.selectedVal[i] = value;
      }

      this.trigger('picker.select', this.selectedVal, this.selectedIndex);

      if (changed) {
        this.trigger(
          'picker.valuechange',
          this.selectedVal,
          this.selectedIndex
        );
      }
    });

    addEvent(this.cancelEl, 'click', () => {
      this.hide();
      this.trigger('picker.cancel');
    });
  }

  _createWheel(wheelEl, i) {
    this.wheels[i] = new BScroll(wheelEl[i], {
      wheel: true,
      selectedIndex: this.selectedIndex[i]
    });
    ((index) => {
      this.wheels[index].on('scrollEnd', () => {
        let currentIndex = this.wheels[index].getSelectedIndex();
        if (this.selectedIndex[i] !== currentIndex) {
          this.selectedIndex[i] = currentIndex;
          this.trigger('picker.change', index, currentIndex);
        }
      });
    })(i);
    return this.wheels[i];
  }

  show(next) {
    let showCls = this.options.showCls;
    // 判断类型
    $(this.pickerEl).css('display', 'block');
    if (this.options.el) {
      this.pickerEl.style.top =
        this.options.el.offsetTop + this.options.el.offsetHeight + 'px';
      this.pickerEl.style.left = this.options.el.offsetLeft + 'px';
      this.pickerEl.style.width = this.options.el.offsetWidth + 'px';
      if (this.state === 'in') {
        $(this.pickerEl).animateCss(
          'slideOut',
          function () {
            this.state = 'out';
            $(this.pickerEl).removeClass('slideOut').css('display', 'none');
          }.bind(this)
        );
      } else {
        $(this.pickerEl).animateCss(
          'slideIn',
          function () {
            this.state = 'in';
            $(this.pickerEl).removeClass('slideIn');
          }.bind(this)
        );
      }
      window.setTimeout(() => {
        next && next();
      }, 0);
    } else {
      window.setTimeout(() => {
        addClass(this.pickerEl, 'full');
        addClass(this.maskEl, showCls);
        addClass(this.panelEl, showCls);

        if (!this.wheels) {
          this.wheels = [];
          for (let i = 0; i < this.data.length; i++) {
            this._createWheel(this.wheelEl, i);
          }
        } else {
          for (let i = 0; i < this.data.length; i++) {
            this.wheels[i].enable();
            this.wheels[i].wheelTo(this.selectedIndex[i]);
          }
        }
        next && next();
      }, 0);
    }
  }

  hide() {
    let showCls = this.options.showCls;
    if (this.options.el) {
      $(this.pickerEl).animateCss(
        'slideOut',
        function () {
          this.state = 'out';
          $(this.pickerEl).removeClass('slideOut').css('display', 'none');
        }.bind(this)
      );
      return;
    }
    removeClass(this.maskEl, showCls);
    removeClass(this.panelEl, showCls);

    window.setTimeout(() => {
      this.pickerEl.style.display = 'none';
      for (let i = 0; i < this.data.length; i++) {
        this.wheels[i].disable();
      }
    }, 500);
  }

  refillColumn(index, data) {
    let scrollEl = this.scrollEl[index];
    let wheel = this.wheels[index];
    if (scrollEl && wheel) {
      let oldData = this.data[index];
      this.data[index] = data;
      scrollEl.innerHTML = itemTemplate(data);

      let selectedIndex = wheel.getSelectedIndex();
      let dist = 0;
      if (oldData.length) {
        let oldValue = oldData[selectedIndex].value;
        for (let i = 0; i < data.length; i++) {
          if (data[i].value === oldValue) {
            dist = i;
            break;
          }
        }
      }
      this.selectedIndex[index] = dist;
      wheel.refresh();
      wheel.wheelTo(dist);
      return dist;
    }
  }

  refill(datas) {
    let ret = [];
    if (!datas.length) {
      return ret;
    }
    datas.forEach((data, index) => {
      ret[index] = this.refillColumn(index, data);
    });
    return ret;
  }

  scrollColumn(index, dist) {
    let wheel = this.wheels[index];
    wheel.wheelTo(dist);
  }
}
