import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import en from 'dayjs/locale/en'

dayjs.locale({
  ...en,
  weekStart: 1,
})
dayjs.extend(weekday)

export {
  dayjs,
}
