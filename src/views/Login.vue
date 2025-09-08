<template>
	<section class="card">
		<h2>Login (GA4 user_id)</h2>
		<div class="row">
			<input v-model="uid" placeholder="user_001" />
			<input v-model="method" placeholder="password / google" />
			<button @click="doLogin">Đăng nhập</button>
		</div>
		<p class="note">Sau khi login, mọi event sẽ gắn user_id. Bạn có thể chuyển sang Basic/Funnel để test.</p>
	</section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Ga4 } from '@/ga4/ga4'

const uid = ref('user_001')
const method = ref('password')

function doLogin() {
	if (!uid.value) {
		alert('Nhập user_id')
		return
	}
	Ga4.setUser(uid.value)
	Ga4.event('login', { method: method.value || 'password' })
	localStorage.setItem('ga4tester_user_id', uid.value)
	alert('Đã login với user_id: ' + uid.value)
}
</script>

<style scoped>
.note { color: #64748b; }
</style>


