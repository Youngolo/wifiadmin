export const formatTimestamp = (timestamp?: number) => {
  // 将时间戳转换为毫秒级
  let time = new Date(timestamp * 1000);

  // 获取小时、分钟和秒数
  let hours = time.getUTCHours().toString().padStart(2, "0");
  let minutes = time.getUTCMinutes().toString().padStart(2, "0");
  let seconds = time.getUTCSeconds().toString().padStart(2, "0");

  // 拼接成时间字符串
  let formattedTime = `${hours}:${minutes}:${seconds}`;

  return formattedTime;
}

//套餐流量转换
export const formatDataSize = (size?: string) => {
  const [value, unit] = size.split("_");
  const byteValue = parseInt(value);

  switch (unit) {
    case "1":
      return `${byteValue}MB`;
    case "1024":
      return `${byteValue}GB`;
    case "1048576":
      return `${byteValue}TB`;
    default:
      return `${byteValue}`;
  }
}
//转换套餐流量
export const convertDataSize = (dataSize?: string) => {
  if (!dataSize) {
    return "";
  }

  const sizeRegex = /(\d+)(\w+)/;
  const matches = dataSize.match(sizeRegex);

  if (!matches || matches.length !== 3) {
    return dataSize;
  }

  const value = parseInt(matches[1]);
  const unit = matches[2];

  let unitValue = 0;

  switch (unit) {
    case "MB":
      unitValue = 1;
      break;
    case "GB":
      unitValue = 1024;
      break;
    case "TB":
      unitValue = 1048576;
      break;
    default:
      return dataSize;
  }

  return `${value}_${unitValue}`;
}


//字节转kb
export const bytesToKB = (bytes?: number) => {
  const kb = bytes / 1024;
  return kb.toFixed(2);
}

//byte转换
export const formatBytes = (input?: string) => {
  if (!input) {
    return '0 B';
  }

  let bytes = parseFloat(input);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;

  while (bytes >= 1024 && i < sizes.length - 1) {
    bytes /= 1024;
    i++;
  }

  const formattedValue = bytes.toFixed(2);
  return `${formattedValue} ${sizes[i]}`;
}

//字符串转字节
export const convertToBytes = (size?: string) => {
  let units = {
    'TB': 1024 * 1024 * 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'MB': 1024 * 1024,
    'KB': 1024,
    'B': 1
  };

  let regex = /^(\d+(?:\.\d+)?)\s*(\w+)$/i;
  let matches = size.match(regex);

  if (!matches) {
    return 0;
  }

  let value = parseFloat(matches[1]);
  let unit = matches[2].toUpperCase();

  if (!units[unit]) {
    return 0;
  }

  return value * units[unit];
}

export const subtractTimeString = (timeString?: string, separator = ":") => {
  // 解析时间字符串，提取天数、小时、分钟和秒钟部分
  const [days, hours, minutes, seconds] = timeString.split(separator).map(part => parseInt(part, 10));

  // 将给定时间转换为毫秒数
  const givenTime = days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;

  // 获取当前时间的毫秒数
  const currentTime = new Date().getTime();

  // 计算时间差，返回结果
  return currentTime - givenTime;
}
