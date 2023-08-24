import { http } from "@/utils/http";
// import iconv from 'iconv-lite';
import { getConfig } from "@/config";
import { type DataInfo } from "@/utils/auth";
// import { fa } from "element-plus/es/locale";
// console.log(iconv);

//读取配置文件内容
function getpath(type) {
  const is_r186x = getConfig()?.is_r186x ?? false;
  // console.warn(getConfig());
  if (type == 'get') {
    return is_r186x == false ? 'goform/goform_get_cmd_process' : 'reqproc/proc_get'
  } else {
    return is_r186x == false ? 'goform/goform_set_cmd_process' : 'reqproc/proc_post'
  }
}
/** api请求 */
export const httpapi = (method: string = 'POST', apiUrl?: string, head?: string, body?: string) => {
  const validMethods = ['get', 'put', 'post', 'delete'];
  const lowerCaseMethod = method.toLowerCase();

  if (!validMethods.includes(lowerCaseMethod)) {
    throw new Error(`请求类型不正确: ${method}`);
  }

  if (apiUrl.length <= 10) {
    throw new Error(`URL可能不正确: ${apiUrl}`);
  }

  let headers;
  if (head.length > 0) {
    try {
      // console.log(head);
      headers = convertStringToObject(head);
    } catch (error) {
      throw new Error(`请求头格式可能不正确: ${head}`);
    }
  }

  let data;
  if (body.length > 0) {
    try {
      data = JSON.parse(body);
      // console.log(body, data);
    } catch (error) {
      data = body;
    }
  }

  return http.request(lowerCaseMethod, apiUrl, { headers, data });
};

function convertStringToObject(str) {
  const lines = str.split('\n');
  const obj = {};

  lines.forEach(line => {
    const [key, value] = line.split(':');
    obj[key.trim()] = value.trim();
  });

  return obj;
}

/** post请求 */
export const postapi = (data?: object) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  return http.request("post", `${baseUrl}/${getpath('post')}`, { headers, data });
};

/** get请求 */
export const getapi = (cmd?: string, hide: boolean = false) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  let data = '';
  if (hide == true) {
    data = `?${cmd}&_=${Date.now()}&hide=Young`
  } else {
    data = `?${cmd}&_=${Date.now()}`
  }
  return http.request("get", `${baseUrl}/${getpath('get')}${data}`, { headers });
};

/** 退出登录 */
export const outLogin = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  const data = new URLSearchParams();
  data.append('goformId', 'LOGOUT');
  return http.request("post", `${baseUrl}/${getpath('post')}`, { headers, data });
};

/** 获取是否登录 */
export const islogin = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  const data = `multi_data=1&cmd=modem_main_state%2Cpin_status%2Cblc_wan_mode%2Cblc_wan_auto_mode%2Cloginfo%2Cfota_new_version_state%2Cfota_current_upgrade_state%2Cfota_upgrade_selector%2Cnetwork_provider%2Cis_mandatory%2Csta_count%2Cm_sta_count&_=${Date.now()}`
  return http.request("get", `${baseUrl}/${getpath('get')}?${data}`, { headers });
};

/** 获取有线列表 */
export const getlanlist = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  const data = `?cmd=lan_station_list&_=${Date.now()}&hide=Young`;
  return http.request("get", `${baseUrl}/${getpath('get')}${data}`, { headers });
};

/** 获取无线列表 */
export const getwifilist = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };
  const data = `?cmd=station_list&_=${Date.now()}&hide=Young`;

  return http.request("get", `${baseUrl}/${getpath('get')}${data}`, { headers });
};

/** 打开/关闭数据漫游 */
export const setnet = (goformId?: string) => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  };

  const data = new URLSearchParams();
  data.append('notCallback', 'true');
  data.append('goformId', goformId);
  return http.request("post", `${baseUrl}/${getpath('post')}`, { headers, data });
};

/** 刷新token */
export const refreshTokenApi = () => {
  const myData: DataInfo<Date> = {
    accessToken: 'eyJhbGciOiJIUzUxMiJ9.Admin',
    expires: new Date(),
    refreshToken: 'eyJhbGciOiJIUzUxMiJ9.adminRefresh',
    username: 'admin',
    roles: ['admin'],
  };
  return myData;
};

/** 获取消息列表 */
export const getmsglist = () => {
  const { version } = __APP_INFO__.pkg;
  return http.request("get", 'https://wifi.api.my-youth.cn/?version=' + version);
};

/** 获取飞猫设备信息 */
export const fm_get_device_information = (ip?: string) => {
  return http.request("get", `http://${ip}:8081/fm_get_device_information`);
};

/** 飞猫设备切卡请求 */
export const fm_set_device_parameters = (ip?: string, data?: object) => {
  const headers = {
    'Accept': 'application/json',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'Content-Type': 'application/json',
  };
  return http.request("post", `http://${ip}:8081/fm_set_device_parameters`, { headers, data });
};
//获取解锁密码：http://192.168.0.1/goform/goform_get_cmd_process?cmd=current_Password%2Cadmin_Password%2Croot_Password&multi_data=1

//16进制转字符串
// 示例用法
//const hexString = '006100610061007C006200620062007C006300630063';
//const asciiString = hexToAscii(hexString); // 'aaa|bbb|ccc'
export const hexToAscii = (hexString?: string) => {
  let asciiString = '';
  for (let i = 0; i < hexString.length; i += 4) {
    const hex = hexString.substr(i, 4);
    const decimal = parseInt(hex, 16);
    asciiString += String.fromCharCode(decimal);
  }
  return asciiString;
}
//字符串转16进制
// 示例用法
//const asciiString = 'aaa|bbb|ccc';
//const hexString = asciiToHex(asciiString); // '006100610061007C006200620062007C006300630063'
export const asciiToHex = (asciiString?: string) => {
  let hexString = '';
  for (let i = 0; i < asciiString.length; i++) {
    const charCode = asciiString.charCodeAt(i);
    const hex = charCode.toString(16).padStart(4, '0');
    hexString += hex;
  }
  return hexString.toUpperCase();
}
//时间转换
// 示例用法
// const timeString = '23,08,12,00,20,52,+32';
// const formattedDateTime = convertToDateTime(timeString);//2023/08/12 00:20:52
export const convertToDateTime = (timeString?: string) => {
  const timeParts = timeString.split(',');
  const year = Number(timeParts[0]);
  const month = Number(timeParts[1]);
  const day = Number(timeParts[2]);
  const hour = Number(timeParts[3]);
  const minute = Number(timeParts[4]);
  const second = Number(timeParts[5]);
  const timezone = Number(timeParts[6]);

  const date = new Date();
  date.setFullYear(2000 + year); // 假设年份是从 2000 开始的
  date.setMonth(month - 1); // 月份从 0 到 11 表示
  date.setDate(day);
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(second);
  date.setMinutes(date.getMinutes() - timezone); // 根据时区进行调整

  const formattedDateTime = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

  return formattedDateTime;
}
//时间转换
// 示例用法
// const timeString = '2023/08/12 00:20:52';
// const formattedDateTime = convertToTimeString(timeString);//23,08,12,00,20,52,+32
export const convertToTimeString = (formattedDateTime?: string) => {
  const date = formattedDateTime ? new Date(formattedDateTime) : new Date();
  const year = date.getFullYear() % 100; // 获取年份的后两位
  const month = date.getMonth() + 1; // 月份从 0 到 11 表示，需要加 1
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const timezoneOffset = date.getTimezoneOffset(); // 获取时区偏移，单位为分钟

  const timezone = -timezoneOffset / 60; // 将分钟数转换为小时数，并取负值

  const timeString = `${year.toString().padStart(2, '0')};${month.toString().padStart(2, '0')};${day.toString().padStart(2, '0')};${hour.toString().padStart(2, '0')};${minute.toString().padStart(2, '0')};${second.toString().padStart(2, '0')};${timezone}`;

  return timeString;
}