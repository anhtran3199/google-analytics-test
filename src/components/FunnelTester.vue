<template>
	<section class="card">
		<h2>Funnel Tester</h2>
		<p class="subtitle">Gửi chuỗi sự kiện mô phỏng funnel thương mại điện tử để dùng trong Funnel report.</p>

		<div class="grid2">
			<label>Product ID <input v-model="productId" placeholder="SKU-123" /></label>
			<label>Value <input v-model.number="value" type="number" min="0" step="0.01" placeholder="199.99" /></label>
			<label>Currency <input v-model="currency" placeholder="USD" /></label>
			<label>Delay giữa các bước (ms) <input v-model.number="stepDelayMs" type="number" min="0" step="100" placeholder="1000" /></label>
		</div>

		<div class="steps">
			<div class="step">
				<div class="title">1) View list</div>
				<button :disabled="!isInitialized" @click="sendListView">Gửi page_view /list</button>
			</div>
			<div class="step">
				<div class="title">2) View item</div>
				<button :disabled="!isInitialized" @click="sendViewItem">Gửi page_view /product/:id</button>
			</div>
			<div class="step">
				<div class="title">3) add_to_cart</div>
				<button :disabled="!isInitialized" @click="sendAddToCart">Gửi add_to_cart</button>
			</div>
			<div class="step">
				<div class="title">4) begin_checkout</div>
				<button :disabled="!isInitialized" @click="sendBeginCheckout">Gửi begin_checkout</button>
			</div>
			<div class="step">
				<div class="title">5) add_payment_info</div>
				<button :disabled="!isInitialized" @click="sendAddPaymentInfo">Gửi add_payment_info</button>
			</div>
			<div class="step">
				<div class="title">6) purchase</div>
				<button :disabled="!isInitialized" @click="sendPurchase">Gửi purchase</button>
			</div>
		</div>

		<div class="row">
			<button :disabled="!isInitialized" @click="sendSequence">Gửi tuần tự tất cả bước</button>
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'
import { Ga4 } from '@/ga4/ga4'

const props = defineProps<{ initialized: boolean }>()
const isInitialized = computed(() => props.initialized)

let productId = $ref('SKU-123')
let value = $ref(199.99)
let currency = $ref('USD')
let stepDelayMs = $ref(800)

function sendListView() {
	Ga4.sendPageView({ page_path: '/list', page_title: 'List' })
}

function sendViewItem() {
	Ga4.sendPageView({ page_path: `/product/${productId}`, page_title: 'Product Detail' })
	Ga4.event('view_item', {
		items: [{ item_id: productId, item_name: 'Product', price: value }],
	})
}

function sendAddToCart() {
	Ga4.event('add_to_cart', {
		currency,
		value,
		items: [{ item_id: productId, item_name: 'Product', quantity: 1, price: value }],
	})
}

function sendBeginCheckout() {
	Ga4.event('begin_checkout', {
		currency,
		value,
		items: [{ item_id: productId, item_name: 'Product', quantity: 1, price: value }],
	})
}

function sendAddPaymentInfo() {
	Ga4.event('add_payment_info', {
		currency,
		value,
		payment_type: 'card',
		items: [{ item_id: productId, item_name: 'Product', quantity: 1, price: value }],
	})
}

function sendPurchase() {
	Ga4.event('purchase', {
		transaction_id: `T-${Date.now()}`,
		currency,
		value,
		tax: Math.round(value * 0.1 * 100) / 100,
		shipping: 0,
		items: [{ item_id: productId, item_name: 'Product', quantity: 1, price: value }],
	})
}

async function sendSequence() {
	sendListView()
	await wait(stepDelayMs)
	sendViewItem()
	await wait(stepDelayMs)
	sendAddToCart()
	await wait(stepDelayMs)
	sendBeginCheckout()
	await wait(stepDelayMs)
	sendAddPaymentInfo()
	await wait(stepDelayMs)
	sendPurchase()
}

function wait(ms: number) {
	return new Promise((r) => setTimeout(r, ms))
}
</script>

<style scoped>
.subtitle { color: #64748b; }
.steps { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.step { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #fff; }
.step .title { font-weight: 600; margin-bottom: 8px; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
</style>


