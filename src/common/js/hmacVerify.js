/* eslint-disable */
// 切割成数组
const _slicedToArray = (function () {
    function sliceIterator(arr, i) {
        const _arr = []
        let _n = true
        let _d = false
        let _e
        try {
            for (
                var _i = arr[Symbol.iterator](), _s;
                !(_n = (_s = _i.next()).done);
                _n = true
            ) {
                _arr.push(_s.value)
                if (i && _arr.length === i) break
            }
        } catch (err) {
            _d = true
            _e = err
        } finally {
            try {
                if (!_n && _i.return) _i.return()
            } finally {
                if (_d) throw _e
            }
        }
        return _arr
    }
    return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i)
        }
        throw new TypeError(
            'Invalid attempt to destructure non-iterable instance',
        )
    }
}())

// nodejs内置模块
const util = require('util')
const urllib = require('url')
const crypto = require('crypto')

// hmac加密
export default function initHmac(params) {
    const createDateHeader = function createDateHeader() {
        return new Date().toGMTString()
    }

    const getHeadersString = function getHeadersString(signatureHeaders) {
        let headers = ''
        let _iteratorNormalCompletion = true
        let _didIteratorError = false
        let _iteratorError

        try {
            for (
                var _iterator = signatureHeaders[Symbol.iterator](), _step;
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
            ) {
                let _step$value = _slicedToArray(_step.value, 2),
                    key = _step$value[0],
                    val = _step$value[1]

                if (headers !== '') {
                    headers += ' '
                }
                headers += key
            }
        } catch (err) {
            _didIteratorError = true
            _iteratorError = err
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return()
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError
                }
            }
        }
        return headers
    }

    const getSignatureString = function getSignatureString(signatureHeaders) {
        let sigString = ''
        let _iteratorNormalCompletion2 = true
        let _didIteratorError2 = false
        let _iteratorError2

        try {
            for (
                var _iterator2 = signatureHeaders[Symbol.iterator](), _step2;
                !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next())
                    .done);
                _iteratorNormalCompletion2 = true
            ) {
                let _step2$value = _slicedToArray(_step2.value, 2),
                    key = _step2$value[0],
                    val = _step2$value[1]

                if (sigString !== '') {
                    sigString += '\n'
                }
                if (key.toLowerCase() === 'request-line') {
                    sigString += val
                } else {
                    sigString += `${key.toLowerCase()}: ${val}`
                }
            }
        } catch (err) {
            _didIteratorError2 = true
            _iteratorError2 = err
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return()
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2
                }
            }
        }

        return sigString
    }

    const sha1HashBase64 = function sha1HashBase64(signatureString, secret) {
        return crypto
            .createHmac('sha1', secret)
            .update(signatureString)
            .digest('base64')
    }

    const validateParams = function validateParams(params) {
        // UserName
        if (!params.userName || !params.userName.length) {
            throw new Error('userName is required')
        }
        // Secret
        if (!params.secret || !params.secret.length) {
            throw new Error('secret is required')
        }
        // URL
        if (!params.url || !params.url.length) {
            throw new Error('url is required')
        }
        // Method
        if (!params.method || !params.method.length) {
            throw new Error('method is required')
        }
        // Method
        const requestMethod = params.method.toUpperCase()
        if (
            requestMethod !== 'GET' &&
            requestMethod !== 'POST' &&
            requestMethod !== 'PATCH' &&
            requestMethod !== 'UPDATE' &&
            requestMethod !== 'DELETE'
        ) {
            throw new Error('method is invalid')
        }
    }

    // Validation
    validateParams(params)

    // Default Value
    const httpVersion = params.httpVersion ? params.httpVersion : 'HTTP/1.1'

    // Determine request method
    const signatureHeaders = new Map()
    const requestMethod = params.method.toUpperCase()

    // Build the request-line header
    const parsedUrl = urllib.parse(params.url)
    const targetUrl = parsedUrl.path
    const requestLine = `${requestMethod} ${targetUrl} ${httpVersion}`

    // Set the date header
    const dateHeader = createDateHeader()
    signatureHeaders.set('x-date', dateHeader)

    // Add to headers for the signature hash
    signatureHeaders.set('request-line', requestLine)

    // Get the list of headers
    const headers = getHeadersString(signatureHeaders)

    // Build the signature string
    const signatureString = getSignatureString(signatureHeaders)

    // Hash the signature string using the specified algorithm
    const signatureHash = sha1HashBase64(signatureString, params.secret)

    // Set the signature hash algorithm
    const algorithm = 'hmac-sha1'

    // Format the authorization header
    const authHeaderFormat = 'hmac username="%s",algorithm="%s",headers="%s",signature="%s"'
    const authHeader = util.format(
        authHeaderFormat,
        params.userName,
        algorithm,
        headers,
        signatureHash,
    )

    // Set the request headers
    const requestHeaders = {
        Host: parsedUrl.hostname,
        Authorization: authHeader,
        Date: dateHeader,
    }

    return requestHeaders
}
