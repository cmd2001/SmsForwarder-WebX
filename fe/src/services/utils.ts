export const parseTime = (time: string) => {
  const now = new Date();
  const date = new Date(time);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    return time.split(' ')[1].slice(0, 5);
  } else if (now.getFullYear() === date.getFullYear()) {
    return time.split(' ')[0].slice(5, 10);
  } else {
    return time.split(' ')[0];
  }
};

export const parseTimeDetailed = (time: string) => {
  const now = new Date();
  const date = new Date(time);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    return time.split(' ')[1].slice(0, 5);
  } else if (now.getFullYear() === date.getFullYear()) {
    return (
      time.split(' ')[0].slice(5, 10) + ' ' + time.split(' ')[1].slice(0, 5)
    );
  } else {
    return time.split(' ')[0] + ' ' + time.split(' ')[1].slice(0, 5);
  }
};
