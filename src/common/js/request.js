import axios from 'axios'
import qs from 'querystring'
import { default as getApiHost, } from './hostMapping.js'
import initHmac from './hmacVerify.js'
const token = localStorage.getItem('token');


/**
 * 请求接口数据统一封装函数
 * @param {object} params                       入参集合
 * @param {string/object} params.apiPath        接口路径。例：'share/list' 或 {root: 'shunli', path: 'abc/def'}
 * @param {string} params.reqType               请求类型。例：get，post等等。
 * @param {object} params.data                  请求参数。
 * @param {boolean} params.stringifyData        是否需要用stringifyData处理data数据
 * @param {string} params.errMsg                错误提示信息
 * @param {boolean} params.showLoading          是否显示“加载中”
 * @param {string} params.loadingText           “加载中”提示文本
 * @param {object} params.headers               自定义请求头参数
 */
export function requestData(params) {
    return new Promise(async (resolve, reject) => {
        // 默认参数值
        const defaultConfig = {
            apiPath: null,
            reqType: 'get',
            data: null,
            stringifyData: true,
            errMsg: '服务繁忙，请稍后重试',
            showLoading: true,
            loadingText: 'Loading...',
            headers: {},
        }
        const {
            apiPath,
            reqType,
            data,
            stringifyData,
            headers,
        } = Object.assign(defaultConfig, params)
        let path = ''

        if (typeof apiPath === 'object') {
            path = `${apiPath.host}${apiPath.path}`
        } else {
            path = `${getApiHost()}${apiPath}`
        }

        const reqConfig = {
            method: reqType.toLowerCase(),
            url: path,
            headers,
        }

        if (reqType === 'get') {
            reqConfig.params = data
        } else {
            if (stringifyData) {
                reqConfig.data = data ? qs.stringify(data) : null
            } else {
                reqConfig.data = data
            }
        }

        // console.log(reqConfig)
        const rsp = await axios.request(reqConfig).catch((error) => {
            let errDetail = ''
            if (error.response) {
                // 请求发送成功，服务端返回非2xx状态码
                errDetail = error.response.data.msg || error.response.data.message
            } else if (error.request) {
                // 请求发送成功，未接收到服务端返回
                errDetail = error.message
            } else {
                // 请求配置出错
                errDetail = error.message
            }

            reject(errDetail)

            return { data: undefined, }
        })
        
        resolve(rsp.data)
    })
}

function getRequestHeader(config) {
    let path = `${getApiHost()}${config.apiPath}`

    if (typeof config.apiPath === 'object') {
        path = `${config.apiPath.host}${config.apiPath.path}`
    }
    const userName = 'web'
    const secret = '4zDm6kdLLzo41uiyKoH5jZm52F3rwzic'
    const url = path
    const method = (config.reqType || 'GET').toUpperCase()
    const params = {
        userName,
        secret,
        url,
        method,
    }
    const headers = initHmac(params)
    return headers
}

export default function (config) {
    return new Promise(async (resolve, reject) => {
        const headersRes = getRequestHeader(config)
        const headers = Object.assign({
            'Authorization': headersRes['Authorization'],
            'x-Date': headersRes['Date'],
            token: token
        }, config.headers)
        const configWithHeaders = Object.assign(config, {
            headers,
        })
        const rsp = await requestData(configWithHeaders).catch((e) => {
            reject(e)
        })
        resolve(rsp)
    })
}
