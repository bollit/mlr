import axios from 'axios';

/**
 * 封装请求函数，返回一个 Promise
 * @param {string} code - API 接口编码
 * @param {string} endpoint - API 接口路径
 * @param {string} method - 请求方法，默认为 'GET'
 * @param {object} params - 请求参数，默认为空对象
 * @returns {Promise<T>} - 返回一个 Promise 对象
 */
export async function apiRequestAxios<T>(

    endpoint: string,
    method: string = 'POST',
    params: Record<string, any> = {}
): Promise<T> {
    let url = `${endpoint}`;

    // 默认请求配置
    const options = {
        headers: {
            'Content-Type': 'application/json', // 设置请求头
            // 'x-auth-token': '470e290d-eb0a-4a3a-8145-647f26724ecc', // 认证 token
        },
    };

    // 如果是 POST 请求，我们构建 POST 请求的 body
    if (method === 'POST' || method === 'PUT') {
        const body = {

            ...params,
        };

        try {
            // 发送 POST 请求，携带参数到指定的 endpoint
            const response = await axios.post(url, body, options);
            return response.data; // 返回服务器的响应数据
        } catch (error) {
            throw error; // 如果请求失败，抛出错误
        }
    }

    // 如果是 GET 请求，将参数附加到 URL 中
    if (method === 'GET') {
        const queryString = new URLSearchParams(params).toString();
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}${queryString}`;
    }

    try {
        // 发送 GET 请求
        const response = await axios.get(url, options);
        return response.data; // 返回服务器的响应数据
    } catch (error) {
        throw error; // 如果请求失败，抛出错误
    }
}