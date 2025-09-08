import { createRouter, createWebHistory } from 'vue-router'
import BasicTester from './views/BasicTester.vue'
import FunnelTesterPage from './views/FunnelTesterPage.vue'
import Login from './views/Login.vue'

export const router = createRouter({
	history: createWebHistory('/google-analytics-test/'),
	routes: [
		{ path: '/', name: 'home', component: BasicTester },
		{ path: '/funnel', name: 'funnel', component: FunnelTesterPage },
		{ path: '/login', name: 'login', component: Login },
	],
})


