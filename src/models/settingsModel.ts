import { minu2ms } from '~/utils/time'

const userName = useStorage('user-name', 'Guest')
const focusDurationMSFromStorage = useStorage('focus-duration', minu2ms(30))
const restDurationMSFromStorage = useStorage('rest-duration', minu2ms(5))

const getDurations = (isDev = false) => {
  return {
    focusDurationMS: isDev ? ref(5000) : focusDurationMSFromStorage,
    restDurationMS: isDev ? ref(5000) : restDurationMSFromStorage,
  }
}

const setUserName = (name: string) => {
  userName.value = name
}
const setFocusDuration = (minu: number) => {
  focusDurationMSFromStorage.value = minu2ms(minu)
}
const setRestDuration = (minu: number) => {
  restDurationMSFromStorage.value = minu2ms(minu)
}

export const useSettingsModel = () => {
  const { focusDurationMS, restDurationMS } = getDurations(false)
  return {
    userName,
    focusDurationMS,
    restDurationMS,
    setUserName,
    setFocusDuration,
    setRestDuration,
  }
}
