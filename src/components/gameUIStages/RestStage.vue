<script lang="ts" setup>
import ActionMenuWindow from '~/components/gameUIStages/widgets/ActionMenuWindow.vue'
import { useCountdownModel } from '~/models/countdownModel'
import { useNotificationModel } from '~/models/notificationModel'
import { useSettingsModel } from '~/models/settingsModel'
import { ms2sec } from '~/utils/time'

const { notificationIntervalMS } = useSettingsModel()
const { isOverTime, countDownTimeSec } = useCountdownModel()
const { showRestTimeoutInfo } = useNotificationModel()

watch([isOverTime, countDownTimeSec], ([newIsOverTime, newCountDownTimeSec]) => {
  const notificationIntervalSec = ms2sec(notificationIntervalMS.value)
  if (
    newIsOverTime
    && (newCountDownTimeSec % notificationIntervalSec < 5)
  )
    showRestTimeoutInfo()
})

</script>
<template>
  <div id="rest-stage">
    <ActionMenuWindow class="w-4/5 absolute top-[30%] left-[10%]" />
  </div>
</template>

<style lang="scss" scoped>

</style>
