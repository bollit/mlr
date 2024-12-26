/**
 * 封装请求函数，返回一个 Promise
 * @param {string} code - API 接口编码
 * @param {string} endpoint - API 接口路径
 * @param {object} params - 请求参数，默认为空对象
 * @param {string} method - 请求方法，默认为 'GET'
 * @returns {Promise<T>} - 返回一个 Promise 对象
 */
export async function apiRequest<T>(code: string, endpoint: string, method: string = 'GET', params: Record<string, any> = {}): Promise<T> {

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
        throw new Error("!!");
    }

    let url = `/api${endpoint}`;
    // let url = `${endpoint}`

    const currentUrl = window.location.href;
    const tokenUrl = new URL(currentUrl);
    const tokenValue = tokenUrl.searchParams.get("token") || "";
    // 设置请求配置
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': tokenValue,
        },
    };

    // 处理 POST/PUT 请求体
    if (method === 'POST' || method === 'PUT') {
        options.body = JSON.stringify({ code: code, params });
    }

    // 如果是 GET 请求，将参数添加到 URL 中
    if (method === 'GET' && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}${queryString}`;
    }

    try {
        const response = await fetch(url, options);

        // 如果响应状态不是 2xx，抛出错误
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data: T = await response.json();
        return data;
    } catch (error) {
        console.error("API request failed:", error);
        throw error;  // 可以根据需要调整错误处理
    }
}
