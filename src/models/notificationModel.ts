
import icon from '/game/poring/poring-walk.gif'

const showFocusTimeoutInfo = () => {
  const {
    isSupported,
    show,
  } = useWebNotification({
    title: 'Time Out!',
    icon,
    body: 'You need to take a break. 😪😪',
    dir: 'auto',
    lang: 'en',
    renotify: true,
    tag: 'notify-timeout',
  })

  if (isSupported) show()
}

const showRestTimeoutInfo = () => {
  const {
    isSupported,
    show,
  } = useWebNotification({
    title: 'Time Out!',
    icon,
    body: 'Keep going to focus',
    dir: 'auto',
    lang: 'en',
    renotify: true,
    tag: 'notify-timeout',
  })

  if (isSupported) show()
}

export const useNotificationModel = () => {
  return {
    showFocusTimeoutInfo,
    showRestTimeoutInfo,
  }
}
