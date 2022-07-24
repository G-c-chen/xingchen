/**
 * 判断是否为移动端
 */
export function isMobile() {
    var u = window.navigator.userAgent;
    return !!u.match(/AppleWebKit.*Mobile.*/);
}

// 判断是否是微信环境
export function isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
    } else {
        return false;
    }
}

export function isAndroid() {
    var u = navigator.userAgent;
    var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
    return isAndroid;
}

export function isIOS() {
    var u = navigator.userAgent;
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return isIOS;
}

export function isYqwHost() {
    // return location.href.indexOf("yiqiwen.cn") > -1;
    return true;
}

const typeOpts = {
    mcqs: {
        title: "幸喵星座",
        aboutTarTitle: "我们",
        androidDownloadText: "安卓",
        iosDownloadText: "IOS",
        hasAccount: false,
        iosDownloadLink:
            "https://apps.apple.com/cn/app/%E8%90%8C%E5%AE%A0%E9%99%AA%E4%BC%B4/id1598896960",
        hasOwnbanner: true,
        aboutContent1:
            "幸喵星座是一个趣味星座工具APP，如果你想要通过星座了解朋友性格、快速跟朋友找到星座话题，找到趣味搞笑的星座冷知识",
        aboutContent2: "你一定要来这里体验APP的功能，",
        aboutContent3: "快来解锁更多有趣的玩法吧！",
        aboutTitle: "关于我们",
        companyText: "四川水熊虫文化传播有限公司",
        ipText: "蜀ICP备20001222号-6",
        showMobileRectLogo: false,
        hasOwnMobileLogo: true,
        showQrcode: false,
    },
};

export const currentType = "mcqs";
export const currentPro = typeOpts[currentType];
