// 地址组件
(function () {
  $.ajax({
    dataType: 'json',
    url: 'http://localhost:3000/address',
    success: function (data) {
      console.log('data', data);
      var prov = []; /* 省，直辖市 */
      var city = []; /* 市 */
      var area = []; /* 镇 */
      var checked = [0, 0, 0]; /* 已选选项 */
      function creatList(obj, list) {
        obj.forEach(function (item) {
          list.push({
            text: item.text,
            value: item.value
          });
        });
      }

      creatList(data, prov); // 获取省列表
      creatList(data[0].children, city); // 获取市列表
      creatList(
        data[0].children[0].children && data[0].children[0].children,
        area
      ); // 获取区列表

      var picker = new Picker({
        data: [prov, city, area],
        selectedIndex: [0, 0, 0],
        title: '地址选择'
      });

      picker.on('picker.select', function (selectedVal, selectedIndex) {
        var text1 = prov[selectedIndex[0]].text;
        var text2 = city[selectedIndex[1]].text;
        var text3 = area[selectedIndex[2]] && area[selectedIndex[2]].text;

        console.log(text1 + ' ' + text2 + ' ' + text3);
        document.querySelector('#address').value =
          text1 + ' ' + text2 + ' ' + text3;
      });

      picker.on('picker.change', function (index, selectedIndex) {
        // 重新更新列表选项
        if (index === 0) {
          firstChange();
        } else if (index === 1) {
          secondChange();
        }

        function firstChange() {
          city = [];
          area = [];
          checked[0] = selectedIndex;
          if (data[selectedIndex].hasOwnProperty('children')) {
            creatList(data[selectedIndex].children, city);

            if (data[selectedIndex].children[0].hasOwnProperty('children')) {
              creatList(data[selectedIndex].children, area);
            } else {
              area = [{ text: '', value: 0 }];
              checked[2] = 0;
            }
          } else {
            city = [{ text: '', value: 0 }];
            area = [{ text: '', value: 0 }];
            checked[1] = 0;
            checked[2] = 0;
          }

          picker.refillColumn(1, city);
          picker.refillColumn(2, area);
          picker.scrollColumn(1, 0);
          picker.scrollColumn(2, 0);
        }

        function secondChange() {
          area = [];
          checked[1] = selectedIndex;
          if (
            data[checked[0]].children[selectedIndex].hasOwnProperty('children')
          ) {
            creatList(data[checked[0]].children[selectedIndex].children, area);
            picker.refillColumn(2, area);
            picker.scrollColumn(2, 0);
          } else {
            area = [{ text: '', value: 0 }];
            checked[2] = 0;
            picker.refillColumn(2, area);
            picker.scrollColumn(2, 0);
          }
        }
      });

      picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
        console.log(selectedVal);
        console.log(selectedIndex);
      });

      document
        .querySelector('#address')
        .addEventListener('click', function (e) {
          e.stopPropagation();
          picker.show();
        });
    }
  });
})();
// checkbox
(function () {
  var picker = new Picker({
    data: [
      { text: 'a', value: 'a' },
      { text: 'b', value: 'b' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' },
      { text: 'c', value: 'c' }
    ],
    selectedIndex: 0,
    el: document.querySelector('#checkbox')
  });

  picker.on('picker.select', function (selectedVal, selectedIndex) {
    console.log('select', selectedVal, selectedIndex);
  });

  picker.on('picker.change', function (index, selectedIndex) {
    console.log('changes', electedVal, selectedIndex);
  });

  picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
    console.log(selectedVal);
    console.log(selectedIndex);
  });

  document.querySelector('#checkbox').addEventListener('click', function (e) {
    e.stopPropagation();
    picker.show();
  });
})();
// 日期
(function () {
  var years = []; /* 年 */
  var month = [
    { text: '一月', value: 1 },
    { text: '二月', value: 2 },
    { text: '三月', value: 3 },
    { text: '四月', value: 4 },
    { text: '五月', value: 5 },
    { text: '六月', value: 6 },
    { text: '七月', value: 7 },
    { text: '八月', value: 8 },
    { text: '九月', value: 9 },
    { text: '十月', value: 10 },
    { text: '十一月', value: 11 },
    { text: '十二月', value: 12 }
  ]; /* 月 */
  var days = []; /* 日 */
  let now = new Date();
  let curYear = now.getFullYear(),
    curMonth = now.getMonth() + 1,
    curDay = now.getDate();
  let checked = [19, curMonth - 1, curDay - 1]; /* 已选选项 */
  for (let i = -30; i < 20; i++) {
    years.unshift({ text: curYear + i + '年', value: curYear + i });
  }
  for (let i = 1; i < new Date(curYear, curMonth, 0).getDate(); i++) {
    days.push({ text: i, value: i });
  }

  var picker = new Picker({
    data: [years, month, days],
    selectedIndex: checked,
    title: '日期'
  });

  picker.on('picker.select', function (selectedVal, selectedIndex) {
    console.log('select', selectedVal, selectedIndex);
  });

  picker.on('picker.change', function (index, selectedIndex) {
    if (index === 1) {
      // 更新日期
    }

    console.log('changes', index, selectedIndex);
  });

  picker.on('picker.valuechange', function (selectedVal, selectedIndex) {
    console.log(selectedVal);
    console.log(selectedIndex);
  });

  document.querySelector('#date').addEventListener('click', function (e) {
    e.stopPropagation();
    picker.show();
  });
})();
