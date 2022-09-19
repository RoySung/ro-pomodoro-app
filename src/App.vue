<script setup lang="ts">
import { useHead } from '@vueuse/head'
import poring from '/game/poring/poring-walk.gif'

// https://github.com/vueuse/head
// you can use this to manipulate the document head in any components,
// they will be rendered correctly in the html results with vite-ssg
useHead({
  title: 'Ro Pomodoro App',
  meta: [
    {
      property: 'og:title',
      content: 'Ro Pomodoro App',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: poring,
    },
    {
      property: 'og:description',
      content: 'Simple Pomodoro App',
    },
    {
      name: 'description',
      content: 'Simple Pomodoro App',
    },
  ],
})
</script>

<template>
  <router-view />
</template>

<style>

</style>
