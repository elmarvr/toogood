export function fromDate(time: number, date = Date.now()) {
  return new Date(date + time * 1000);
}
