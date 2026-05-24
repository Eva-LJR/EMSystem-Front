import axios from 'axios'
import store from '@/store'
import Router from '@/router'
import { removeToken,getToken } from '@/utils/auth'

const service = axios.create({
  // baseURL: "http://localhost:8081", // url = base url + request url
  baseURL: '/api',
  withCredentials: false,
  timeout: 500000
})


// axios请求拦截器
// axios请求拦截器
service.interceptors.request.use(
  config => {
    // 💡 核心改动：直接从本地/Cookie获取 Token，绕过 Vuex 状态未同步的坑
    const token = getToken()
    
    if (token) {
      // 确保每次请求都能雷打不动地带上最新的 Token
      // 注意：'Bearer ' 后面有一个空格，千万别删掉
      config.headers['Authorization'] = 'Bearer ' + token
    } else {
      console.warn('请求拦截器警告：本地未找到 Token，本次请求未携带认证信息');
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

//axios响应拦截器
service.interceptors.response.use(res=>{
    if (res.data.code === 0 && res.data.msg === 'NOT_LOGIN') {// 返回登录页面
        console.log('用户为登录, 直接跳转至登录页面');
        removeToken();
        Router.replace('/login');
        return res;
      } else {
        return res;
      }
    },
    
    error => {
      // console.log('err' + error)
      // let { message } = error;
      // if (message == "Network Error") {
      //   message = "后端接口连接异常";
      // }
      // else if (message.includes("timeout")) {
      //   message = "系统接口请求超时";
      // }
      // else if (message.includes("Request failed with status code")) {
      //   message = "系统接口" + message.substr(message.length - 3) + "异常";
      // }
      // return Promise.reject(error)
      if (error.response) {
        // 处理响应错误
        console.log('HTTP状态码:', error.response.status);
        console.log('响应数据:', error.response.data);
        if (error.response.status === 401) {
          console.log('用户未登录或令牌过期');
          removeToken(); // 清除本地存储的Token
          Router.replace('/login'); // 跳转到登录页面
        } else {
          // 其他HTTP错误处理
          let message = error.message;
          if (message === "Network Error") {
            message = "后端接口连接异常";
          } else if (message.includes("timeout")) {
            message = "系统接口请求超时";
          } else if (message.includes("Request failed with status code")) {
            message = "系统接口" + message.substr(message.length - 3) + "异常";
          }
          console.error(message);
        }
      } else {
        console.log('Error:', error.message);
      }
      return Promise.reject(error); // 将错误向上层抛出
    

})

export default service
