<template>
  <div class="page">
            <div class="header">
            <input
                class="text-input"
                v-model="words"
                placeholder="请输入关键词搜索微信群"
            />
            <div
                class="clear-input"
                @click.stop="clearInput"
            ></div>
            <div
                class="search-btn"
                @click.stop="reloadData"
            >搜索</div>
        <div class="code-box" ref="codeBox">
          <div ref="qrcode" class="code-content"></div>
        </div>
        </div>
        <div>
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
              <img class="item-avatar" :src="`${host}${item.avatar}`" alt="">
              <div class="item-desc">
                <p class="item-title line-ellipsis1">{{item.name}}</p>
                <div class="item-count">
                  <template v-if="item.num > 0">
                    <span class="num">{{item.num}}人</span>
                    <span class="line">|</span>
                  </template>
                  <span class="date">{{item.create_time}}</span>
                </div>
              </div>
              <span class="item-btn" @click="getQRcode(item)">
                加群
              </span>
            </div>
            <div
                v-if="finished && !list.length && isLogin"
                class="no-data"
            >
                --暂无数据--
            </div>
        </van-list>
        </div>
        <van-popup v-model="showPop" position="center" class="code-pop">
          <div class="content">
            <p class="code-title">扫码加群</p>
            <p class="code-tips">网上交易慎重考虑</p>
            <img class="code-img" :src="imgData" alt="">
          </div>
        </van-popup>
        <van-popup v-model="show" position="top" :style="{ height: '20%' }" get-container="#app">内容</van-popup>
  </div>
</template>

<script>
import request from "../common/js/request";
import html2canvas from "html2canvas";
import QRCode from "qrcodejs2";

export default {
  data() {
    return {
      list: [],
      words: "",
      type: "all",
      page: 1,
      loading: false,
      finished: false,
      host: "http://pbwl-wecat.oss-cn-shanghai.aliyuncs.com/",
      imgData: null,
      qrcode_url: "",
      quncardInfo: {},
      showPop: true,
      isLogin: true,
      show: true,
    };
  },
  methods: {
    clearInput() {},
    reloadData() {},
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
        width: width || 200,
        height: height || 200,
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
        console.log(this.imgData, 'this.imgData');
        this.$nextTick(() => {
          this.showPop = true;
        })
      });
    },
    // 获取二维码
    getQRcode(item) {
      let { id } = item;
      request({
        apiPath: `/Quncard/getQunCard?id=${id}`,
      }).then(res => {
        console.log(res, "res==");
        let quncard = res.quncard;
        console.log(quncard);
        this.qrcode_url = quncard.qrcode;
        this.initCode();
      });
    },
    async loadData() {
      // https://wecat.ncrm.vip/Quncard/getQuncardList?page=1&words=&type=all
      let { words, type, page } = this;
      request({
        apiPath: `/Quncard/getQuncardList?page=${page}&words=${words}&type=${type}`,
      }).then(res => {
        this.loading = false;
        if (res.code !== 0) {
          console.log(res, 'res');
          this.finished = true;
          this.isLogin = false;
          return;
        }
        console.log(res.list.data, "res");
        let list = res.list.data;
        this.list = this.list.concat(list);
        console.log(this.list, "===list===");
        this.page++;
      });
    },
  },
  mounted() {
    this.loadData();
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
  padding: 8px 24px;
  height: 88px;
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
  padding-top: 88px;
  .item {
    display: flex;
    padding: 30px;
    align-items: center;
    .item-avatar {
      width: 88px;
      height: 88px;
      border-radius: 8px;
    }
    .item-desc {
      margin-left: 20px;
      flex: 1;
      .item-title {
        font-size: 28rpx;
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
  }
}
.code-pop {
  .content {
    width: 400px;
    height: 400px;
  }
}
.code-box {
  opacity: 0;
  position: absolute;
  top: -1000px;
  left: 0;
}
</style>
