<template>
	<div class="container">
		<header class="header">
			<h1>GA4 Tester</h1>
			<nav class="tabs">
				<router-link to="/" class="tab" active-class="active" exact-active-class="active">Basic</router-link>
				<router-link to="/funnel" class="tab" active-class="active">Funnel</router-link>
			</nav>
		</header>
		<router-view />
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Ga4 } from './ga4/ga4'
import { DEFAULT_MEASUREMENT_ID } from './config'
const measurementId = ref<string>(DEFAULT_MEASUREMENT_ID || '')
const pagePath = ref<string>('/')
const userId = ref<string>('')
const userPropKey = ref<string>('')
const userPropValue = ref<string>('')
const isInitialized = ref<boolean>(false)
const useFixedSession = ref<boolean>(false)
const clientId = ref<string | null>(null)

const selectedEvent = ref<'custom' | 'login' | 'sign_up' | 'purchase'>('custom')
const eventName = ref<string>('custom_event')
const eventParams = ref<string>('{}')

watch(selectedEvent, (v) => {
	if (v !== 'custom') {
		eventName.value = v
	} else {
		eventName.value = 'custom_event'
	}
})

async function initializeGa4() {
	if (!measurementId.value) {
		alert('Vui lòng nhập Measurement ID (G-XXXXXXXXXX)')
		return
	}
	await Ga4.initialize(measurementId.value)
	isInitialized.value = true
	clientId.value = await Ga4.getClientId()
}

function sendPageView() {
	Ga4.sendPageView({ page_path: pagePath.value })
}

function setUserProps() {
	Ga4.setUser(userId.value || undefined)
	if (userPropKey.value && userPropValue.value) {
		Ga4.setUserProperties({ [userPropKey.value]: userPropValue.value })
	}
}

function sendEvent() {
	let params: Record<string, unknown> = {}
	try {
		params = eventParams.value ? JSON.parse(eventParams.value) : {}
	} catch (e) {
		alert('JSON tham số không hợp lệ')
		return
	}
	Ga4.event(eventName.value, params)
}

onMounted(async () => {
	// Tự động khởi tạo nếu có Measurement ID mặc định
	if (measurementId.value) {
		await initializeGa4()
		// Gửi page_view đầu tiên với đường dẫn thực tế trên GitHub Pages
		pagePath.value = location.pathname
		Ga4.sendPageView({ page_path: pagePath.value, page_title: document.title })
		clientId.value = await Ga4.getClientId()
		;(window as any).__ga4_initialized = true
	}
})

async function toggleFixedSession() {
	if (useFixedSession.value) {
		Ga4.enableFixedSession()
	} else {
		Ga4.disableFixedSession()
	}
}
</script>

<style scoped>
.container {
	max-width: 900px;
	margin: 32px auto;
	padding: 0 16px;
}
.header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.tabs { display: flex; gap: 8px; }
.tab { padding: 8px 12px; border-radius: 6px; background: #e5e7eb; color: #0f172a; text-decoration: none; }
.tab.active { background: #0ea5e9; color: #fff; }
</style>


