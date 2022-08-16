<template>
  <div class="page">
      <div class="page-content">
          <div class="header">
            <input
                class="text-input"
                v-model="words"
                v-on:keyup.enter="searchClick"
                placeholder="请输入关键词搜索微信群"
            />
            <div
                class="clear-input"
                v-if="words"
                @click.stop="clearInput"
            ></div>
            <div
                class="search-btn"
                @click.stop="searchClick"
            >搜索</div>
        <div class="code-box" ref="codeBox">
          <div ref="qrcode" class="code-content"></div>
        </div>
        </div>
        <!-- navs -->
        <div class="navs">
          <div class="nav-item" @click="changeNav(item)" :class="{active: curType === item.type}"
            v-for="(item, index) in navs" :key="index">
            {{item.title}}
          </div>
        </div>
        <div class="page-content">
          <van-list
            class="list"
            v-model="loading"
            :finished="finished"
            @load="loadData"
            :immediate-check="true"
        >
            <div
                v-for="(item, index) in list"
                :key="index"
                class="item"
                v-if="item.type !== 'ad'"
            >
              <img class="item-avatar" :src="item.type === 'mine' ? item.avatar : `${host}${item.avatar}`" alt="">
              <div class="item-desc">
                <p class="item-title line-ellipsis1">{{item.name}}</p>
                <div class="item-count">
                  <template v-if="item.num > 0">
                    <span class="num">{{item.num}}人</span>
                    <span class="line">|</span>
                  </template>
                  <span class="date">{{timeago(item.create_time)}}</span>
                </div>
              </div>
              <span class="item-btn" :class="{active: item.note && showPage}" @click="getQRcode(item)">
                {{(item.note && showPage) ? '已查看' : '加群'}}
              </span>
            </div>
            <div
                v-if="finished && !list.length && isLogin && !noData"
                class="no-more"
            >
                --暂无更多数据--
            </div>
        </van-list>
        </div>
        <div class="no-data" v-if="noData">
          --暂无数据--
        </div>
      </div>
      
      <!-- <van-popup v-model="showMineCode">

      </van-popup> -->
      <!-- <div class="tips-content" v-else>
        <img src="../assets/wechat.jpeg" alt="">
        <p>-- 登录已过期,有疑问请联系站长 --</p>
        <p class="tips-txt" v-if="mode === 'official' || 1" @click="toLogin">点击重新登录</p>
        <p v-if="mode === 'temp'">请购买使用</p>
      </div> -->
        <!-- <van-popup v-model="showPop" position="center" class="code-pop">
          <div class="content">
            <p class="code-title">扫码加群</p>
            <p class="code-tips">网上交易慎重考虑</p>
            <img class="code-img" :src="imgData" alt="">
          </div>
        </van-popup>
        <van-popup v-model="show" position="top" :style="{ height: '20%' }" get-container="#app">内容</van-popup> -->
        <div class="common-pop" v-if="showPop">
          <div class="pop-mark" @click.stop="hideCodePop"></div>
          <div class="pop-content">
            <p class="code-title">扫码加群</p>
            <template v-if="!verify">
              <p class="code-tips">网上交易慎重考虑</p>
              <p class="out-tips" v-if="isTimeOut(quncardInfo.create_time)">该群发布时间为{{timeago(quncardInfo.create_time)}},该二维码可能已过期</p>
              <img class="code-img" :src="imgData" alt="">
            </template>
            <template v-else>
              <div class="verify-box">
                <input type="text" v-model="captcha_code" placeholder="请输入验证码">
                <img :src="verifyImg" alt="">
              </div>
              <span class="verify-btn" @click="getQRcode(checkItem)">获取二维码</span>
            </template>
          </div>
        </div>
  </div>
</template>

<script>
import request from "../common/js/request";
import html2canvas from "html2canvas";
import QRCode from "qrcodejs2";
import { Toast } from "vant";

export default {
  data() {
    return {
      tempCode: 'gcchen_hahaha1',
      officialCode: 'gcchan_cxc',
      showPage: false,
      session_time: false,
      code: '',
      list: [],
      mineList: [
        {
          name: '电商创业交流群',
          avatar: 'https://img1.imgtp.com/2022/08/10/jbLHGIvW.png',
          type: 'mine',
          create_time: 1660138063,
          qrcode: 'https://weixin.qq.com/g/AwYAAEL67LHQPVHW3UNnVP7euul3V4nICNhddKzbVm15GgpPyrVT1P72Pwv5MJtQ',
        }
      ],
      words: "",
      type: "all",
      page: 1,
      loading: false,
      finished: false,
      host: "http://pbwl-wecat.oss-cn-shanghai.aliyuncs.com/",
      imgData: null,
      qrcode_url: "",
      quncardInfo: {},
      showPop: false,
      isLogin: true,
      noData: false,
      verify: false,
      verifyImg: '',
      captcha_code: '',
      captcha_key: '',
      checkItem: null,
      curType: 'all',
      navs: [
        {
          title: '实时更新',
          type: 'all'
        },
        {
          title: '百人群',
          type: 'good'
        },
        {
          title: '企业微信群',
          type: 'qyqun'
        },
      ]
    };
  },
  computed: {
    mode() {
      // 临时: tempCode, 正式: tempCode, 无效: invalid
      let {tempCode, officialCode, code} = this;
      let seeion_code = localStorage.getItem('code');
      code = code || seeion_code;
      let mode = ''
      if (code === tempCode) {
        mode = 'temp';
      } else if (code === officialCode) {
        mode = 'official';
      } else {
        mode = 'invalid';
      }
      // console.log(mode, 'mode');
      return mode;
    }
  },
  methods: {
    /**
     * 设置同类多实例的响应缓存（防止缓存内存过大的处理）
     * @param classKey 缓存的一个类型
     * @param key 该缓存类型的一个实例
     * @param val 该缓存实例的值
     * @param expire 该缓存实例的过期时间戳（秒级）
     */
    setClassStorage(
        classKey = '',
        key = '',
        val = '',
        expire = Math.floor(Date.now() / 1000) + 7 * 86400
    ) {
        let obj = JSON.parse(localStorage.getItem(classKey) || '{}');
        obj[key] = {
            val,
            e: expire,
        };
        let nowTime = Math.floor(Date.now() / 1000);
        let newObj = {};
        Object.keys(obj).forEach((objKey) => {
            let item = obj[objKey];
            if (item.e > nowTime) {
                newObj[objKey] = item;
            }
        });
        localStorage.setItem(classKey, JSON.stringify(newObj));
    },
    /**
      * 获取同类多实例的响应缓存
      * @param classKey 缓存的一个类型
      * @param key 该缓存类型的一个实例
      * @return Object {val: key的缓存值, e: key的过期时间戳}
      */
    getClassStorage(classKey = '', key = '') {
        let obj = JSON.parse(localStorage.getItem(classKey)|| '{}');
        if (obj && obj[key] && obj[key].e > Math.floor(Date.now() / 1000)) {
            return obj[key];
        } else {
          if (obj && obj[key]) {
            // console.log('1234');
            return {val: false};
          } else {
            return {};
          }
        }
    },
    changeNav(item) {
      this.curType = item.type;
      this.reloadData();
    },
    isTimeOut(create_time) {
      let nowTime = Date.now();
      let time = create_time;
      let offset = 60 * 60 * 24 * 3;
      nowTime = parseInt(nowTime/1000);
      if (nowTime - time > offset) {
        return true;
      }
      return false;
    },
    showCodePop() {
      this.showPop = true;
    },
    hideCodePop() {
      this.showPop = false;
    },
    clearInput() {
      this.words = '';
    },
    searchClick() {
      this.curType = 'all';
      this.reloadData();
    },
    reloadData() {
      this.page = 1;
      this.finished = false;
      this.noData = false;
      this.list = [];
      // console.log('搜索');
      this.loadData();
    },
    initCode() {
      // 使用$nextTick确保数据渲染
      this.$nextTick(() => {
        if (this.qrcode_url) {
          this.codeWidth = Number(this.$refs.codeBox.clientHeight);
          this.codeHeight = Number(this.$refs.codeBox.clientWidth);
          this.showCode(this.codeWidth, this.codeHeight);
        }
      });
    },
    showCode(width, height) {
      if (this.$refs.qrcode) {
        this.$refs.qrcode.innerHTML = "";
      }
      const qrcode = new QRCode(this.$refs.qrcode, {
        text: this.qrcode_url, //要跳转的链接
        width: 200,
        height: 200,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.L, // L M  H
      });
      this.createPicture();
    },
    createPicture() {
      html2canvas(this.$refs.qrcode, {
        backgroundColor: null,
        width: 200,
        height: 200,
      }).then(canvas => {
        const imgData = canvas.toDataURL("image/jpeg");
        this.imgData = imgData;
        // console.log(this.imgData, 'this.imgData');
        this.$nextTick(() => {
          this.showCodePop();
        })
      });
    },
    // 获取二维码
    getQRcode(item) {
      if (!this.showPage) {
        Toast('没有查看权限, 若已购买请重新登录查看');
        return;
      }
      this.checkItem = item;
      let { id } = item;
      let { captcha_code, captcha_key, verify } = this;
      if (item.type !== 'mine') {     
        let url = `/Quncard/getQunCard?id=${id}`;
        if (verify) {
          url = `/Quncard/getQunCard?id=${id}&captcha_code=${captcha_code}&captcha_key=${captcha_key}`;
        }
        request({
          apiPath: url,
        }).then(res => {
          if (res.code != '0') {
            if (res.code === 3) {
              // 需要验证
              this.verify = true;
              this.getVerifyCode();
            }
            return;
          }
          this.verify = false;
          this.captcha_code = '';
          item.note = {};
          // console.log(res, "res==");
          let quncard = res.quncard;
          // console.log(quncard);
          this.quncardInfo = quncard;
          this.qrcode_url = quncard.qrcode;
          this.initCode();
        });
      } else {
        this.quncardInfo = item;
        this.qrcode_url = item.qrcode;
        item.note = {};
        this.initCode();
      }
    },
    getVerifyCode() {
      request({
        apiPath: '/tool/getCaptcha'
      }).then(res => {
        this.verifyImg = res.image;
        this.captcha_key = res.key;
          this.showCodePop();
      })
    },
    async loadData() {
      // https://wecat.ncrm.vip/Quncard/getQuncardList?page=1&words=&type=all
      let { words, curType, page } = this;
      request({
        apiPath: `/Quncard/getQuncardList?page=${page}&words=${words}&type=${curType}`,
      }).then(res => {
        this.loading = false;
        if (res.code !== 0) {
          // console.log(res, 'res');
          this.finished = true;
          this.isLogin = false;
          return;
        }
        // console.log(res.list.data, "res");
        let list = res.list.data;
        if (!list.length) {
          this.finished = true;
        }
        list = list.filter(item => {
          return item.type !== 'ad';
        })
        this.list = this.list.concat(list);
        if (!this.list.length) {
          this.finished = true;
          this.noData = true;
        }
        // console.log(this.list, "===list===");
        // 添加收费的群信息
        if (this.page === 1 && curType === 'all') {
          if (words) {
            let arr = this.mineList.filter(item => {
              return item.name.includes(words);
            })
            this.list.unshift(...arr);
            } else {
            this.list.unshift(...this.mineList);
          }
          console.log(this.list, 'list');
        }
        this.page++;
      });
    },
   timeago(dateTimeStamp){   //dateTimeStamp是一个时间毫秒，注意时间戳是秒的形式，在这个毫秒的基础上除以1000，就是十位数的时间戳。13位数的都是时间毫秒。
   dateTimeStamp = dateTimeStamp * 1000;
    var minute = 1000 * 60;      //把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();   //获取当前时间毫秒
    // console.log(now)
    var diffValue = now - dateTimeStamp;//时间差

    if(diffValue < 0){
    	return;
    }
	var minC = diffValue/minute;  //计算时间差的分，时，天，周，月
	var hourC = diffValue/hour;
	var dayC = diffValue/day;
	var weekC = diffValue/week;
	var monthC = diffValue/month;
	//此处考虑小数情况，感谢 情非得已https://blog.csdn.net/weixin_48495574 指正
  let result = '';
	if(monthC >= 1 && monthC < 4){
		result = " " + parseInt(monthC) + "月前"
	}else if(weekC >= 1 && weekC < 4){
		result = " " + parseInt(weekC) + "周前"
	}else if(dayC >= 1 && dayC < 7){
		result = " " + parseInt(dayC) + "天前"
	}else if(hourC >= 1 && hourC < 24){
		result = " " + parseInt(hourC) + "小时前"
	}else if(minC >= 1 && minC < 60){
		result =" " + parseInt(minC) + "分钟前"
	}else if(diffValue >= 0 && diffValue <= minute){
    	result = "刚刚"
    }else {
    	var datetime = new Date();
		datetime.setTime(dateTimeStamp);
		var Nyear = datetime.getFullYear();
		var Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
		var Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
		var Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
		var Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
		var Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    	result = Nyear + "-" + Nmonth + "-" + Ndate
    }
	return result;
},
toLogin() {
  location.href = 'https://gcchen.cn';
}
  },
  mounted() {
    this.loadData();
    this.code = this.$route.query.code || '';
    this.$router.push('/');
    if (this.code) {
      localStorage.setItem('code', this.code);
    }
    let code = this.code || localStorage.getItem('code') || '';
    if (this.officialCode === code) {
      this.showPage = true;
    }
  },
};
</script>

<style lang="less" scoped>
.page {
  min-block-size: 100vh;
  max-width: 10rem;
  margin: 0 auto;
}
.header {
  position: fixed;
  top: 0;
  left: 0;
  padding: 30px 30px;
  height: 110px;
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  align-items: center;
  .text-input {
    outline: none;
    border: 1px solid #e6e6e6;
    height: 72px;
    line-height: 72px;
    flex: 1;
    padding-right: 160px;
    padding-left: 30px;
    box-sizing: border-box;
    font-size: 32px;
    background: transparent;
    border-radius: 36px;
    color: #333;
    min-width: 100px;

  }
  .clear-input {
    position: absolute;
    right: 100px;
    transform: translateY(-50%);
    top: 50%;
    background: url("https://img-cdn.tengzhihh.com/image/ad63020c6a8759-32x32.png")
      no-repeat left center;
    width: 32px;
    height: 32px;
    background-size: 32px 32px;
    padding-right: 60px;
    box-sizing: border-box;
  }
  .search-btn {
    font-size: 32px;
    color: #ff4e01;
    margin-left: 20px;
  }
}
.list {
  padding-top: 88px + 110px;
  .item {
    display: flex;
    margin: 0 30px;
    padding: 50px 0;
    align-items: center;
    border-bottom: 1px solid #d2d2d2;
    .item-avatar {
      width: 88px;
      height: 88px;
      border-radius: 8px;
    }
    .item-desc {
      margin-left: 20px;
      flex: 1;
      .item-title {
        font-size: 28px;
        color: #333;
        text-align: left;
      }
      .item-count {
        display: flex;
        align-items: center;
        font-size: 24px;
        color: #999;
        margin-top: 20px;
        .num {
        }
        .line {
          margin: 0 16px;
        }
      }
    }
    .item-btn {
      margin-left: 30px;
      display: inline-block;
      padding: 5px 10px;
      color: #fff;
      border-radius: 6px;
      font-size: 28px;
      background-color: #07c160;
    }
    .active {
      background-color: #ff976a;
    }
  }
}
.code-pop {
  .content {
    width: 400px;
    height: ç400px;
  }
}
.code-box {
  opacity: 0;
  position: fixed;
  top: -1000px;
  left: 0;
}
.common-pop {
  position: fixed;
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 999;

  .pop-mark {
    position: fixed;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    z-index: 99;
  }
  .pop-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    min-height: 400px;
    background-color: #fff;
    border-radius: 12px;
    z-index: 999;
  }
  .code-title {
    font-size: 32px;
    color: #333;
    text-align: center;
    padding-top: 20px;
    font-weight: 700;
  }
  .code-tips {
    color: #ff5858;
    font-size: 24px;
    padding-top: 20px;
    font-weight: 700;
  }
  .out-tips {
    color: #ff5858;
    font-size: 24px;
    padding-top: 20px;
    font-weight: 700;
  }
  .code-img {
    width: 450px;
    // height: 500px;
    background-color: #fff;
    padding: 40px;
  }
}
.no-data {
  position: absolute;
  font-size: 28px;
  color: #999;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.verify-box {
  display: flex;
  align-items: center;
  margin-top: 100px;
  padding: 0 30px;
  input {
    flex: 1;
    padding: 20px;
    border-bottom: 1px solid #d2d2d2;
  }
  img {
    width: 150px;
  }
}
.verify-btn {
  display: inline-block;
  padding: 5px 10px;
  color: #fff;
  border-radius: 6px;
  font-size: 28px;
  background-color: #07c160;
  margin-top: 50px;
}
	.navs {
		display: flex;
		align-items: center;
		width: 100%;
		position: fixed;
		top: 110px;
    height: 88px;
		left: 0;
		z-index: 2;

		.nav-item {
			flex: 1;
			height: 88px;
			line-height: 88px;
			font-size: 30px;
			color: #999999;
			text-align: center;
			background-color: #FFFFFF;

			&.active {
				color: #333333;
				font-weight: 700;
				position: relative;

				&::after {
					content: '';
					display: inline-block;
					position: absolute;
					width: 76px;
					height: 6px;
					background: #FCB911;
					border-radius: 2px;
					bottom: 0;
					left: 50%;
					transform: translateX(-50%);
				}
			}
		}
	}
  .tips-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 32px;
    img {
      width: 500px;
    }
    .tips-txt {
      color: #07c160;
      margin-top: 40px;
    }
  }
</style>
