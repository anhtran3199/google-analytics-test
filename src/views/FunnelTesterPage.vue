<template>
	<section>
		<FunnelTester :initialized="initialized" />
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FunnelTester from '@/components/FunnelTester.vue'
// Simple mirror of initialized state via global window flag set in App mount
const initialized = computed(() => (window as any).__ga4_initialized === true)
</script>


