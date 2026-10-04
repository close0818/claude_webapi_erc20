<script setup>
import { ref } from 'vue'
const props = defineProps({ text: String })
const done = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    done.value = true
    setTimeout(() => (done.value = false), 1500)
  } catch (e) {
    window.prompt('請手動複製', props.text)
  }
}
</script>
<template>
  <div class="copy">
    <code><slot>{{ text }}</slot></code>
    <button class="sm" type="button" @click="copy">{{ done ? '已複製' : '複製' }}</button>
  </div>
</template>
