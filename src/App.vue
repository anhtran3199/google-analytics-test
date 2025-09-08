<template>
	<div class="container">
		<h1>GA4 Tester</h1>
		<p class="subtitle">Nhập Measurement ID để khởi tạo và thử gửi sự kiện đến Google Analytics 4.</p>

		<section class="card">
			<h2>Khởi tạo GA4</h2>
			<div class="row">
				<input v-model="measurementId" placeholder="G-XXXXXXXXXX" />
				<button @click="initializeGa4">Khởi tạo</button>
			</div>
			<p v-if="isInitialized" class="ok">Đã khởi tạo với Measurement ID: {{ measurementId }}</p>
			<p v-else class="warn">Chưa khởi tạo</p>
		</section>

		<section class="card">
			<h2>Page view</h2>
			<div class="row">
				<input v-model="pagePath" placeholder="/demo" />
				<button :disabled="!isInitialized" @click="sendPageView">Gửi page_view</button>
			</div>
		</section>

		<section class="card">
			<h2>User properties</h2>
			<div class="grid2">
				<input v-model="userId" placeholder="user_id" />
				<input v-model="userPropKey" placeholder="property key (vip_level)" />
				<input v-model="userPropValue" placeholder="property value (gold)" />
				<button :disabled="!isInitialized" @click="setUserProps">Cập nhật</button>
			</div>
		</section>

		<section class="card">
			<h2>Gửi sự kiện</h2>
			<div class="grid2">
				<select v-model="selectedEvent">
					<option value="custom">Tự do (custom)</option>
					<option value="login">login</option>
					<option value="sign_up">sign_up</option>
					<option value="purchase">purchase</option>
				</select>
				<input v-model="eventName" :disabled="selectedEvent !== 'custom'" placeholder="event_name" />
				<textarea v-model="eventParams" rows="4" placeholder='Tham số JSON, ví dụ: {"value": 9.99, "currency": "USD"}'></textarea>
				<button :disabled="!isInitialized" @click="sendEvent">Gửi event</button>
			</div>
			<p class="note">Mẹo: Mở DevTools → Console để xem log. Kiểm tra Network tab (collect).</p>
		</section>
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
	}
})
</script>

<style scoped>
.container {
	max-width: 900px;
	margin: 32px auto;
	padding: 0 16px;
}
h1 { margin: 0 0 8px; }
.subtitle { color: #666; margin: 0 0 16px; }
.card {
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 16px;
	margin: 16px 0;
	background: #fff;
}
.row { display: flex; gap: 8px; align-items: center; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
input, select, textarea { width: 100%; padding: 8px 10px; border: 1px solid #cdd5df; border-radius: 6px; }
button { padding: 8px 12px; border-radius: 6px; background: #0ea5e9; color: white; border: none; cursor: pointer; }
button:disabled { background: #93c5fd; cursor: not-allowed; }
.ok { color: #059669; }
.warn { color: #b45309; }
.note { color: #64748b; font-size: 12px; }
</style>


