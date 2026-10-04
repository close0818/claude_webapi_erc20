<script setup>
import { ref } from 'vue'
import { loadAddresses, removeAddress } from '../api'
const emit = defineEmits(['pick'])
const list = ref(loadAddresses())
function del(a) { removeAddress(a); list.value = loadAddresses() }
</script>
<template>
  <div v-if="list.length" class="chips">
    <span class="hint">我的地址:</span>
    <span v-for="a in list" :key="a.address" class="chip" :title="a.address" @click="emit('pick', a.address)">
      {{ a.merchant }} · {{ a.address.slice(0, 8) }}…{{ a.address.slice(-4) }}
      <span @click.stop="del(a.address)" style="margin-left:4px;opacity:.6">×</span>
    </span>
  </div>
</template>
