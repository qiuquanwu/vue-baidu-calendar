<template>
  <div class="op-calendar-pc">
    <div class="op-calendar-pc-box">
      <div class="op-calendar-pc-left">
        <div class="op-calendar-pc-select-box" style="visibility: visible">
          <div class="op-calendar-pc-year-box">
            <Select
              v-model:value="selectYear"
              style="width: 100px"
              @change="handleChange"
            >
              <Option
                v-for="item of yearsOptions"
                :value="item.value"
                :key="item.value"
              >
                {{ item.text }}
              </Option>
            </Select>
          </div>
          <div class="op-calendar-pc-month-box">
            <Select
              v-model:value="selectMonth"
              style="width: 80px"
              @change="handleChangeMonth"
            >
              <Option
                v-for="item of monthOptions"
                :value="item.value"
                :key="item.value"
              >
                {{ item.text }}
              </Option>
            </Select>
          </div>
          <div class="op-calendar-pc-holiday-box">
            <Select style="width: 80px" @change="handleChangeDate">
              <Option
                v-for="item of HOLIDAY"
                :value="item.date"
                :key="item.date"
              >
                {{ item.name }}
              </Option>
            </Select>
          </div>
          <span
            class="op-calendar-pc-backtoday OP_LOG_BTN"
            hidefocus="true"
            @click="returnToday"
            >返回今天</span
          >
        </div>
        <div class="op-calendar-pc-table-box">
          <table class="op-calendar-pc-table">
            <tbody>
              <tr style="text-align: center">
                <th>一</th>
                <th>二</th>
                <th>三</th>
                <th>四</th>
                <th>五</th>
                <th class="op-calendar-pc-table-weekend">六</th>
                <th class="op-calendar-pc-table-weekend">日</th>
              </tr>
              <tr v-for="lineDateArray of fullDateArray">
                <td v-for="item of lineDateArray" key="item.date">
                  <div class="op-calendar-pc-relative">
                    <a
                      href="javascript:void(0);"
                      :class="{
                        'op-calendar-pc-table-selected': item.isSelectClass,
                        'op-calendar-pc-table-other-month': item.otherMonth,
                        'op-calendar-pc-table-festival': item.hasTerm,
                        'op-calendar-pc-table-weekend': item.isWeekend,
                        'op-calendar-pc-table-work': item.isWorkDay,
                        'op-calendar-pc-table-rest': item.isRestDay,
                      }"
                      :date="item.date"
                      @click="selectDayAction"
                    >
                      <span
                        class="op-calendar-pc-table-holiday-sign"
                        v-if="item.isWorkDay"
                        >班</span
                      >
                      <span
                        class="op-calendar-pc-table-holiday-sign"
                        v-if="item.isRestDay"
                        >休</span
                      >
                      <span class="op-calendar-pc-daynumber">{{
                        item.day
                      }}</span>
                      <span class="op-calendar-pc-table-almanac">{{
                        item.d_day
                      }}</span>
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="op-calendar-pc-right">
        <p class="op-calendar-pc-right-date">{{ selectDayDate }}</p>
        <p class="op-calendar-pc-right-day">{{ dayInfo.cDay }}</p>
        <p class="op-calendar-pc-right-lunar c-gap-top-small">
          <span>{{ dayInfo.monthCn }}{{ dayInfo.dayCn }}</span
          ><span>{{ dayInfo.gzYear }}年 {{ dayInfo.animal }}</span
          ><span>{{ dayInfo.gzMonth }}月 {{ dayInfo.gzDay }}日</span>
        </p>
        <p class="op-calendar-pc-right-holid1" v-if="dayInfo.lunarFestival">
          {{ dayInfo.lunarFestival }}
        </p>
        <p class="op-calendar-pc-right-holid1" v-if="dayInfo.festival">
          {{ dayInfo.festival }}
        </p>
        <div
          :class="{
            'op-calendar-pc-right-almanacbox': true,
            'op-calendar-pc-right-hover': hoverClass,
          }"
        >
          <div
            class="op-calendar-pc-right-almanac"
            @mouseover="isHover"
            @mouseout="isHover"
          >
            <span class="op-calendar-pc-right-suit"
              ><i>宜</i
              >搬家<br />装修<br />开业<br />结婚<br />入宅<br />领证<br />开工<br />动土<br />出行</span
            >
            <span class="op-calendar-pc-right-avoid"
              ><i>忌</i
              >祈福<br />纳畜<br />经络<br />栽种<br />斋醮<br />词讼<br />置产</span
            >
          </div>
          <div class="op-calendar-hover-almanac">
            <span class="op-calendar-hover-suit"
              ><i>宜</i
              >搬家、装修、开业、结婚、入宅、领证、开工、动土、出行、订婚、上梁、开张、旅游、入学、赴任、修造、祭祀、开市、纳财、裁衣、嫁娶、纳采、移徙、盖屋、立券、求医、竖柱、求财</span
            >
            <span class="op-calendar-hover-avoid"
              ><i>忌</i>祈福、纳畜、经络、栽种、斋醮、词讼、置产</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="op-calendar-pc-holidaytip"></div>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  onMounted,
  nextTick,
  defineEmit,
  defineProps,
} from "vue";
import mGetDate from "./utils/mGetDate.js";
import solarLunar from "./utils/solarLunar.js";
// import { Select } from "ant-design-vue";
import  Select  from "ant-design-vue/es/select/index.js";
import  "ant-design-vue/es/select/style/index.css";
const { Option } = Select;
// import solarLunar from "solarlunar-es";
import nextDay from "./utils/nextDay.js";
import lastDay from "./utils/lastDay.js";
import {
  LUNAR_FESTIVAL,
  FESTIVAL,
  ARRANGE_HOLIDAY,
  WORKING_DAYS,
  HOLIDAY,
} from "./utils/lunarFestival.js";
// 选中的日期
const selectDayDate = ref("");
const fullDateArray = ref([]);
const emit = defineEmit(["change"]);

const props = defineProps({
  date: String,
  range: {
    type: Array,
    default: [2010, 2030],
  },
});

// 选中的日
const selectDay = ref("");
// 选中的月
const selectMonth = ref("");
// 选中的年
const selectYear = ref("2021");
const yearsOptions = [];
let dayInfo = ref({});
let time = new Date();
dayInfo.value = solarLunar.solar2lunar(
  time.getFullYear(),
  time.getMonth() + 1,
  time.getDate()
);
for (let i = props.range[0]; i < props.range[1]; i++) {
  yearsOptions.push({
    value: i,
    text: i + "年",
  });
}
const monthOptions = [];
for (let i = 1; i <= 12; i++) {
  monthOptions.push({
    value: i,
    text: i + "月",
  });
}
const handleChange = (value) => {
  selectYear.value = value;
  selectDayDate.value = [
    value,
    selectDayDate.value.split("-")[1],
    selectDayDate.value.split("-")[2],
  ].join("-");
  nextTick(generate);
};
const handleChangeMonth = (value) => {
  selectMonth.value = value;
  selectDayDate.value = [
    selectDayDate.value.split("-")[0],
    value,
    selectDayDate.value.split("-")[2],
  ].join("-");
  nextTick(generate);
};

// calendar.solar2lunar(1987,11,01);
const init = () => {
  getDateToday();
  if (props.date) {
    selectDayDate.value = props.date;
  }
  generate();
  //   0-6 7-12
};
//获取今天
const getDateToday = () => {
  let today = new Date();
  let fullYear = today.getFullYear();
  let month = today.getMonth() + 1;
  let day = today.getDate();
  selectDay.value = today;
  selectYear.value = fullYear;
  selectMonth.value = month;
  selectDayDate.value = [fullYear, month, day].join("-");
};
const generate = () => {
  let year = selectYear.value;
  let month = selectMonth.value;
  let day = 1;
  let dayArr = [];
  const DAY_LENTH = 42;
  let startDay = new Date([year, month, day].join("-"));
  let itemDay = [year, month, day].join("-");
  let week = startDay.getDay();
  week = week == 0 ? 7 : week;
  // 开始push
  for (let i = 1; i < week; i++) {
    itemDay = lastDay(new Date(itemDay));
    let { term, dayCn, monthCn, cDay, cMonth, cYear } = solarLunar.solar2lunar(
      ...itemDay.split("-")
    );
    if (FESTIVAL[cMonth] && FESTIVAL[cMonth][cDay]) {
      term = FESTIVAL[cMonth][cDay];
    }

    if (LUNAR_FESTIVAL[monthCn] && LUNAR_FESTIVAL[monthCn][dayCn]) {
      term = LUNAR_FESTIVAL[monthCn][dayCn];
    }
    let isWorkDay, isRestDay;
    if (
      WORKING_DAYS[cYear] &&
      WORKING_DAYS[cYear][cMonth] &&
      WORKING_DAYS[cYear][cMonth][cDay]
    ) {
      isWorkDay = true;
    }

    if (ARRANGE_HOLIDAY[cYear] && ARRANGE_HOLIDAY[cYear][cMonth]) {
      let range = ARRANGE_HOLIDAY[cYear][cMonth];
      if (cDay >= range[0] && cDay <= range[1]) isRestDay = true;
    }

    dayArr.push({
      day: itemDay.split("-")[2],
      date: itemDay,
      d_day: term ? term : dayCn,
      isSelectClass: selectDayDate.value == itemDay,
      otherMonth: true,
      hasTerm: term,
      isWeekend:
        (new Date(itemDay).getDay() == 6 || new Date(itemDay).getDay() == 0) &&
        !isWorkDay,
      isWorkDay: isWorkDay,
      isRestDay: isRestDay,
    });
  }
  itemDay = [year, month, day].join("-");
  dayArr = dayArr.reverse();
  for (let i = 0; i <= DAY_LENTH - week; i++) {
    let { term, dayCn, monthCn, cMonth, cDay, cYear } = solarLunar.solar2lunar(
      ...itemDay.split("-")
    );
    if (FESTIVAL[cMonth] && FESTIVAL[cMonth][cDay]) {
      term = FESTIVAL[cMonth][cDay];
    }
    if (LUNAR_FESTIVAL[monthCn] && LUNAR_FESTIVAL[monthCn][dayCn]) {
      term = LUNAR_FESTIVAL[monthCn][dayCn];
    }
    let isWorkDay, isRestDay;
    if (
      WORKING_DAYS[cYear] &&
      WORKING_DAYS[cYear][cMonth] &&
      WORKING_DAYS[cYear][cMonth][cDay]
    ) {
      isWorkDay = true;
    }

    if (ARRANGE_HOLIDAY[cYear] && ARRANGE_HOLIDAY[cYear][cMonth]) {
      let range = ARRANGE_HOLIDAY[cYear][cMonth];
      if (cDay >= range[0] && cDay <= range[1]) isRestDay = true;
    }
    dayArr.push({
      date: itemDay,
      day: itemDay.split("-")[2],
      d_day: term ? term : dayCn,
      isSelectClass: selectDayDate.value == itemDay,
      otherMonth: itemDay.split("-")[1] != month,
      hasTerm: term,
      isWeekend:
        (new Date(itemDay).getDay() == 6 || new Date(itemDay).getDay() == 0) &&
        !isWorkDay,
      isWorkDay: isWorkDay,
      isRestDay: isRestDay,
    });
    itemDay = nextDay(new Date(itemDay));
  }
  //   清空原来的数据
  fullDateArray.value = [];
  for (let i = 0; i <= 5; i++) {
    fullDateArray.value.push(dayArr.splice(0, 7));
  }
};
//初始化
onMounted(init);
//监听selectDayDate选中日期
watch(selectDayDate, (newValue) => {
  selectYear.value = newValue.split("-")[0];
  selectMonth.value = newValue.split("-")[1];
  let info = solarLunar.solar2lunar(...newValue.split("-"));
  dayInfo.value = {
    lunarFestival: LUNAR_FESTIVAL[info.monthCn]
      ? LUNAR_FESTIVAL[info.monthCn][info.dayCn]
      : undefined,
    festival: FESTIVAL[info.cMonth]
      ? FESTIVAL[info.cMonth][info.cDay]
      : undefined,
    ...info,
  };
  //触发事件
  emit("change", { date: newValue, ...dayInfo.value });
  nextTick(generate);
});
const selectDayAction = (e) => {
  const date = e.target.parentNode.getAttribute("date")
    ? e.target.parentNode.getAttribute("date")
    : e.target.getAttribute("date");
  selectDayDate.value = date;
};
const returnToday = () => {
  getDateToday();
};
const hoverClass = ref(false);
const isHover = () => {
  hoverClass.value = !hoverClass.value;
};
const handleChangeDate = (value) => {
  selectDayDate.value = value;
};
</script>

<style>
.opui-scroll-ctrl-content {
  overflow: hidden;
}

.op-calendar-pc {
  /* margin: 0 -16px; */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.op-calendar-pc-box {
  height: 472px;
  position: relative;
  z-index: 1;
}

.op-calendar-pc-box .c-dropdown2 {
  height: 30px;
  line-height: 30px;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-menu {
  top: 35px;
  border: none;
  border-radius: 6px;
  padding: 8px 0;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-menu .opui-scroll-ctrl-scroll {
  top: 10px;
  width: 6px;
  border-top: none;
  border-left: 2px solid #f5f5f6;
}
.op-calendar-pc-box
  .c-dropdown2
  .c-dropdown2-menu
  .opui-scroll-ctrl-scroll-hover {
  border-bottom: none;
}
.op-calendar-pc-box
  .c-dropdown2
  .c-dropdown2-menu
  .opui-scroll-ctrl-scroll-touch {
  border-right: none;
  border-bottom: none;
}
.op-calendar-pc-box
  .c-dropdown2
  .c-dropdown2-menu
  .opui-scroll-ctrl-scroll
  .opui-scroll-axis {
  width: 6px;
  background: transparent;
}
.op-calendar-pc-box
  .c-dropdown2
  .c-dropdown2-menu
  .opui-scroll-ctrl-scroll
  .opui-scroll-slider {
  margin-left: -2px;
  width: 2px;
  border: none;
  background: #4e6ef2;
  border-radius: 1px;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-option.c-dropdown2-selected {
  background-color: transparent;
  color: #315efb;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-btn-group {
  height: 100%;
  border-radius: 6px;
  border: 1px solid #d7d9e0;
  box-sizing: border-box;
  box-shadow: none;
  overflow: hidden;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-btn-group:hover {
  border: 1px solid #9195a3;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-btn {
  position: relative;
  height: 100%;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-btn-icon {
  width: 34px;
  height: 28px;
  line-height: 28px;
  padding: 0;
  background-color: transparent;
  box-shadow: none;
  -webkit-box-shadow: none;
  cursor: pointer;
}
.op-calendar-pc-box .c-dropdown2 .c-dropdown2-btn-icon-border {
  width: 34px;
  height: 100%;
  border-left: none;
  background-color: transparent;
}
.op-calendar-pc-box
  .c-dropdown2
  .c-dropdown2-btn-icon-border
  .c-icon-triangle-down {
  background: url(//www.baidu.com/aladdin/tpl/calendar_pc/arrow_down.2eed9b1d.png);
  background: url(https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=3269611755,3985075452&fm=179&app=35&f=PNG?w=32&h=32&s=2DE0532490F40C37367E350F0300E081)
    no-repeat center;
  background-size: 16px auto;
}

.op-calendar-pc-year-box,
.op-calendar-pc-month-box,
.op-calendar-pc-holiday-box {
  float: left;
  margin-right: 9px;
  color: #333;
  min-width: 80px;
}

.op-calendar-pc-year-box {
  width: 96px;
}

.op-calendar-pc-month-box {
  position: relative;
  width: 80px;
  padding: 0 34px;
  z-index: 1;
}

.op-calendar-pc-holiday-box {
  width: 96px;
}

.op-calendar-pc-select-box {
  height: 30px;
  zoom: 1;
  visibility: hidden;
}

.op-calendar-pc-backtoday {
  float: right;
  margin-right: 2px;
  width: 68px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #f5f5f6;
  border-radius: 6px;
  color: #333;
  cursor: pointer;
}
.op-calendar-pc-backtoday:hover {
  color: #315efb;
  background: #f0f0f1;
}
.op-calendar-pc-holidaystyle .op-calendar-pc-backtoday:hover {
  color: #f73131;
  background: #f0f0f1;
}

.op-calendar-pc-left {
  height: 100%;
  padding: 16px 16px 0;
  float: left;
  border-radius: 16px 0 0 16px;
  border: 2px solid #4e6ef2;
  border-right: none;
  box-sizing: border-box;
}

.op-calendar-pc-table-box {
  margin-top: 14px;
}

.op-calendar-pc-month-box .c-dropdown2-btn-icon-border {
  border-color: transparent;
  _border-color: transparent;
  background-color: transparent !important;
}

.op-calendar-pc .c-dropdown2 .c-dropdown2-btn-icon {
  padding-left: 0;
}

.op-calendar-pc-prev-month,
.op-calendar-pc-next-month {
  position: absolute;
  top: 0;
  display: block;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  color: #9195a3;
  font-size: 16px;
  cursor: pointer;
}

.op-calendar-pc-prev-month {
  left: 0;
  background: url(//www.baidu.com/aladdin/tpl/calendar_pc/arrow_left.6742b04d.png);
  background: url(https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=54065302,3336211460&fm=179&app=35&f=PNG?w=32&h=32&s=6DE11A6690BD0035D978148A0300C092)
    no-repeat center;
  background-size: 16px auto;
}

.op-calendar-pc-next-month {
  right: 0;
  background: url(//www.baidu.com/aladdin/tpl/calendar_pc/arrow_right.eb28ae9c.png);
  background: url(https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=3134411966,35003376&fm=179&app=35&f=PNG?w=32&h=32&s=4DE11B6690FD80350B54E59A0300E092)
    no-repeat center;
  background-size: 16px auto;
}

.op-calendar-pc-table {
  border-collapse: collapse;
  border-spacing: 0;
}

.op-calendar-pc-table th {
  height: 36px;
  line-height: 36px;
  font-weight: normal;
  font-size: 14px;
}

.op-calendar-pc-table td {
  padding: 2px;
}

.op-calendar-pc-table td a {
  display: block;
  width: 60px;
  height: 56px;
  padding-top: 8px;
  text-align: center;
  text-decoration: none;
  line-height: 1;
  white-space: nowrap;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;
}

.op-calendar-pc-relative {
  position: relative;
  zoom: 1;
}

.op-calendar-pc-relative .op-calendar-pc-table-selected,
.op-calendar-pc-relative a:hover {
  border: 2px solid #bdbfc8;
}

.op-calendar-pc-table-rest.op-calendar-pc-table-selected,
.op-calendar-pc-table-rest:hover {
  border: 2px solid #f38686 !important;
}

.op-calendar-pc-daynumber {
  display: block;
  height: 22px;
  font-size: 18px;
  color: #000;
}

.op-calendar-pc-table-almanac {
  display: block;
  color: #333;
  font-size: 12px;
}

.op-calendar-pc-table-weekend .op-calendar-pc-daynumber,
.op-calendar-pc-table-festival .op-calendar-pc-table-almanac,
.op-calendar-pc-table-rest .op-calendar-pc-daynumber {
  color: #f73131;
}

.op-calendar-pc-table-other-month {
  filter: alpha(opacity=40);
  opacity: 0.4;
}

.op-calendar-pc-table-today {
  border: 2px solid #4e6ef2 !important;
}

.op-calendar-pc-table-rest {
  background: rgb(247, 49, 49, 0.15);
}

.op-calendar-pc-table-work {
  background: #f5f5f6;
}

.op-calendar-pc-table-holiday-sign {
  position: absolute;
  left: 4px;
  top: 4px;
  color: #f73131;
  font-size: 12px;
  line-height: 12px;
  *line-height: 12px;
}

.op-calendar-pc-table-work .op-calendar-pc-daynumber {
  color: #000;
}

.op-calendar-pc-table-work .op-calendar-pc-table-holiday-sign {
  color: #626675;
}

.op-calendar-pc-right {
  height: 100%;
  margin-left: 480px;
  color: #fff;
  text-align: center;
  border-radius: 0 16px 16px 0;
  background: #4e6ef2;
}

.op-calendar-pc-right-date {
  line-height: 45px;
  font-size: 13px;
}

.op-calendar-pc-right-day {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto;
  line-height: 80px;
  font-size: 52px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.op-calendar-pc-right-lunar span {
  display: block;
}

.op-calendar-pc-right-holid1 {
  position: relative;
  margin-top: 13px;
  padding-left: 22px;
  padding-right: 14px;
  text-align: justify;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
}

.op-calendar-pc-right-holid2 {
  position: relative;
  margin-top: 13px;
  padding-left: 22px;
  padding-right: 14px;
  text-align: justify;
  color: #fff;
  font-size: 12px;
  line-height: 16px;
}

.op-calendar-pc-right-holid1::before,
.op-calendar-pc-right-holid2::before {
  content: "";
  position: absolute;
  top: 6px;
  left: 16px;
  width: 3px;
  height: 3px;
  background: #fff;
  border-radius: 50%;
}

.op-calendar-pc-right-almanacbox {
  position: relative;
  margin-top: 12px;
  padding-top: 12px;
  padding-bottom: 100px;
  margin-bottom: -100px;
  background: rgba(255, 255, 255, 0.15);
}

.op-calendar-pc-right-almanac {
  font-size: 12px;
  line-height: 20px;
  overflow: hidden;
}

.op-calendar-pc-right-suit {
  display: inline-block;
  width: 50%;
  float: left;
}

.op-calendar-pc-right-avoid {
  display: inline-block;
  width: 50%;
  float: right;
}

.op-calendar-pc-right-almanac i {
  display: block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: 0 auto;
  font-style: normal;
  font-size: 24px;
  color: #fff;
}

.op-calendar-pc-right-hover .op-calendar-hover-almanac {
  display: block;
}

.op-calendar-hover-almanac {
  display: none;
  position: absolute;
  z-index: 100;
  width: 190px;
  top: 0;
  right: -230px;
  background: #fff;
  padding: 16px;
  color: #333;
  font-size: 13px;
  border-radius: 6px;
  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.1);
}

.op-calendar-hover-suit,
.op-calendar-hover-avoid {
  padding-left: 34px;
  position: relative;
  display: block;
  min-height: 30px;
  text-align: left;
}

.op-calendar-hover-avoid {
  margin-top: 10px;
}

.op-calendar-hover-suit i,
.op-calendar-hover-avoid i {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  font-style: normal;
  font-size: 18px;
  background: #4e6ef2;
  border-radius: 6px;
}

.op-calendar-hover-avoid i {
  background: #f73131;
}

.op-calendar-pc-holidaytip {
  display: none;
  position: relative;
  background: #f7f7f7;
  padding: 10px 10px 10px 0;
}

.op-calendar-pc-holidaytip p {
  margin-left: 35px;
}

.op-calendar-pc-holidaytip-icon {
  position: absolute;
  left: 0;
  top: 10px;
  padding-left: 10px;
  width: 20px;
  height: 20px;
  text-align: center;
  font: 20px/20px Simsun;
  color: #61b0ff;
}

.op-calendar-pc-holidaytip-icon i {
  font-style: normal;
  font: 14px/20px Tahoma, Arial;
  position: absolute;
  width: 20px;
  height: 20px;
  right: 0;
  top: 0;
}

.op-calendar-pc-holidaystyle .op-calendar-pc-left {
  border-color: #eb3636;
}

.op-calendar-pc-holidaystyle .op-calendar-pc-right {
  /*filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#cb1c18, endColorstr=#f44f23, grandientType=0);
        background: -moz-linear-gradient(top, #cb1c18, #f44f23);*/
  background: #eb3636;
}

.op-calendar-pc-holidaystyle .op-calendar-pc-right-almanac {
  border-top-color: #eb7563;
}

.op-calendar-pc-holidaystyle .op-calendar-pc-table th {
  border-color: #f55c4e;
}

.op-calendar-pc-holidaystyle .op-calendar-hover-almanac {
  border-color: #cb1c18;
}
</style>
