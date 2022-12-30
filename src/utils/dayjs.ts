import dayjs from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import dayOfYear from 'dayjs/plugin/dayOfYear'
import en from 'dayjs/locale/en'

dayjs.locale({
  ...en,
  weekStart: 1,
})
dayjs.extend(weekday)
dayjs.extend(dayOfYear)

export {
  dayjs,
}
