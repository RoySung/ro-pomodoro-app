<template>
  <div v-if="isShow" class="settings-window overflow-hidden">
    <div class="absolute top-0 left-0  barrier w-full h-full bg-gray-400 opacity-60"></div>
    <WindowLayout ref="windowRef" class="w-4/5 absolute top-[20%] left-[10%]" title="Settings">
      <template #content>
        <div class="text-black text-xs bg-white p-3">
          <div class="nes-field">
            <label for="name_field">Your Name</label>
            <input
              id="name_field"
              v-model="newUserName"
              :class="{'is-success': isEditedName}"
              type="text"
              class="nes-input"
            >
          </div>
          <br>
          <div class="nes-field">
            <label for="focus_duration_field">Focus Time</label>
            <input
              id="focus_duration_field"
              v-model="focusDurationMinu"
              type="number"
              :class="{
                'nes-input': true,
                'is-success': isEditedFocusDur
              }"
              placeholder="Minute"
            >
          </div>
          <br>
          <div class="nes-field mb-4">
            <label for="rest_duration_field">Rest Time </label>
            <input
              id="rest_duration_field"
              v-model="restDurationMinu"
              type="number"
              :class="{
                'nes-input': true,
                'is-success': isEditedRestDur
              }"
              placeholder="Minute"
            >
          </div>
        </div>
      </template>
      <template #footer>
        <div class="text-black text-xs py-2 px-3 border-[#c5c5c5] border-t-1 flex justify-end">
          <r-button @click="saveSettings">
            Save
          </r-button>
          <r-button class="ml-2" @click="cancel">
            Cancel
          </r-button>
        </div>
      </template>
    </WindowLayout>
  </div>
</template>

<script lang="ts" setup>
import WindowLayout from '~/components/gameUIStages/widgets/WindowLayout.vue'
import RButton from '~/components/Button.vue'
import { ms2minu } from '~/utils/time'
import { useSettingsModel } from '~/models/settingsModel'

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
  setUserName,
  setFocusDuration,
  setRestDuration,
} = useSettingsModel()

const newUserName = ref('')
const focusDurationMinu = ref(0)
const restDurationMinu = ref(0)

const isEditedName = computed(() => newUserName.value !== userName.value)
const isEditedFocusDur = computed(() => focusDurationMinu.value !== ms2minu(focusDurationMS.value))
const isEditedRestDur = computed(() => restDurationMinu.value !== ms2minu(restDurationMS.value))

const setupValues = () => {
  focusDurationMinu.value = ms2minu(focusDurationMS.value)
  restDurationMinu.value = ms2minu(restDurationMS.value)
  newUserName.value = userName.value
}

const saveSettings = () => {
  setUserName(newUserName.value)
  setFocusDuration(focusDurationMinu.value)
  setRestDuration(restDurationMinu.value)

  closeWindow()
}

const cancel = () => {
  setupValues()
  closeWindow()
}

onMounted(() => {
  setupValues()
})

const windowRef = ref(null)
onClickOutside(windowRef, () => {
  closeWindow()
})

</script>

<style lang="scss" scoped>

</style>
