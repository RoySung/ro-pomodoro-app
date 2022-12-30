<template>
  <form
    class="settings-window overflow-hidden"
    @submit.prevent="saveSettings"
  >
    <div class="absolute top-0 left-0  barrier w-full h-full bg-gray-400 opacity-60"></div>
    <transition
      :css="false"
      @leave="(el, done) => motions['settings-window'].leave(done)"
    >
      <WindowLayout
        v-if="isShow"
        ref="windowRef"
        v-motion="'settings-window'"
        :initial="{
          opacity: 0,
          scale: 0,
        }"
        :enter="{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 200,
            ease: 'easeInOut',
          },
        }"
        :leave="{
          opacity: 0,
          scale: 0,
        }"
        class="w-4/5 absolute top-[20%] left-[10%]"
        title="Settings"
      >
        <template #content>
          <div class="text-black text-xs bg-white p-3">
            <div class="nes-field  mb-4">
              <label for="name_field">Your Name</label>
              <input
                id="name_field"
                v-model="newUserName"
                :class="{'is-success': isEditedName}"
                type="text"
                class="nes-input"
              >
            </div>
            <div class="nes-field  mb-4">
              <label for="focus_duration_field">Focus Time (Minute)</label>
              <input
                id="focus_duration_field"
                v-model="newFocusDurationMinu"
                type="number"
                min="1"
                :class="{
                  'nes-input': true,
                  'is-success': isEditedFocusDur,
                  'is-error': !validateNumber(newFocusDurationMinu)
                }"
                placeholder="Minute"
              >
            </div>
            <div class="nes-field mb-4">
              <label for="rest_duration_field">Rest Time (Minute)</label>
              <input
                id="rest_duration_field"
                v-model="newRestDurationMinu"
                type="number"
                min="1"
                :class="{
                  'nes-input': true,
                  'is-success': isEditedRestDur,
                  'is-error': !validateNumber(newRestDurationMinu)
                }"
                placeholder="Minute"
              >
            </div>
            <div class="nes-field mb-4">
              <label for="rest_duration_field">Notification Interval (Minute)</label>
              <input
                id="rest_duration_field"
                v-model="newNotificationIntervalMinu"
                type="number"
                min="1"
                :class="{
                  'nes-input': true,
                  'is-success': isEditedNotifInterval,
                  'is-error': !validateNumber(newNotificationIntervalMinu)
                }"
                placeholder="Minute"
              >
            </div>
            <div class="nes-field mb-4">
              <span>Muted: </span>
              <span>
                <label>
                  <input
                    v-model="newIsMuted"
                    type="radio"
                    class="nes-radio"
                    name="answer"
                    :value="false"
                  />
                  <span>No</span>
                </label>
                <label>
                  <input
                    v-model="newIsMuted"
                    type="radio"
                    class="nes-radio"
                    name="answer"
                    :value="true"
                  />
                  <span>Yes</span>
                </label>

              </span>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="text-black text-xs py-2 px-3 border-[#c5c5c5] border-t-1 flex justify-end">
            <r-button type="submit">
              Save
            </r-button>
            <r-button class="ml-2" @click="cancel">
              Cancel
            </r-button>
          </div>
        </template>
      </WindowLayout>
    </transition>
  </form>
</template>

<script lang="ts" setup>
import { useMotions } from '@vueuse/motion'
import WindowLayout from '~/components/gameUIStages/widgets/WindowLayout.vue'
import RButton from '~/components/Button.vue'
import { ms2minu } from '~/utils/time'
import { useSettingsModel } from '~/models/settingsModel'

const motions = useMotions()

defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:isShow'])
const closeWindow = () => emit('update:isShow', false)

const {
  userName,
  focusDurationMS,
  restDurationMS,
  notificationIntervalMS,
  isMuted,
  setUserName,
  setFocusDuration,
  setRestDuration,
  setNotificationInterval,
  setIsMuted,
} = useSettingsModel()

const newUserName = ref('')
const newFocusDurationMinu = ref(0)
const newRestDurationMinu = ref(0)
const newNotificationIntervalMinu = ref(0)
const newIsMuted = ref(false)

const isEditedName = computed(() => newUserName.value !== userName.value)
const isEditedFocusDur = computed(() => newFocusDurationMinu.value !== ms2minu(focusDurationMS.value))
const isEditedRestDur = computed(() => newRestDurationMinu.value !== ms2minu(restDurationMS.value))
const isEditedNotifInterval = computed(() => newNotificationIntervalMinu.value !== ms2minu(notificationIntervalMS.value))

const setupValues = () => {
  newFocusDurationMinu.value = ms2minu(focusDurationMS.value)
  newRestDurationMinu.value = ms2minu(restDurationMS.value)
  newNotificationIntervalMinu.value = ms2minu(notificationIntervalMS.value)
  newUserName.value = userName.value
  newIsMuted.value = isMuted.value
}

const saveSettings = () => {
  setUserName(newUserName.value)
  setFocusDuration(newFocusDurationMinu.value)
  setRestDuration(newRestDurationMinu.value)
  setNotificationInterval(newNotificationIntervalMinu.value)
  setIsMuted(newIsMuted.value)

  closeWindow()
}

const cancel = () => {
  setupValues()
  closeWindow()
}

const validateNumber = (n: number) => {
  return n > 0
}

onMounted(() => {
  setupValues()
})

const windowRef = ref(null)
onClickOutside(windowRef, () => {
  cancel()
})

</script>

<style lang="scss" scoped>

</style>
