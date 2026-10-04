<script setup>
defineProps({ error: Object })
</script>
<template>
  <div v-if="error" class="alert err">
    <b>失敗<span v-if="error.code"> (code {{ error.code }})</span></b>
    <div>{{ error.hint || error.message }}</div>
    <div v-if="error.hint && error.message !== error.hint" class="hint">{{ error.message }}</div>
  </div>
</template>
