type GtagCommand = 'config' | 'event' | 'set'

declare global {
	interface Window {
		dataLayer?: unknown[]
		gtag?: (...args: unknown[]) => void
	}
}

export class Ga4 {
	private static loaded = false
	private static measurementId: string | null = null

	static async initialize(measurementId: string): Promise<void> {
		if (this.loaded && this.measurementId === measurementId) return
		this.measurementId = measurementId

		// inject gtag.js
		if (!window.dataLayer) {
			window.dataLayer = []
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		;(window as any).gtag = function gtag() {
			// eslint-disable-next-line prefer-rest-params
			;(window.dataLayer as unknown[]).push(arguments)
		}
		window.gtag('js', new Date())
		// Load GA4 script
		await this.loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`)
		window.gtag('config' satisfies GtagCommand, measurementId)
		this.loaded = true
		console.log('[GA4] initialized', measurementId)
	}

	private static loadScript(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const existing = document.querySelector(`script[src="${src}"]`)
			if (existing) {
				resolve()
				return
			}
			const s = document.createElement('script')
			s.async = true
			s.src = src
			s.onload = () => resolve()
			s.onerror = () => reject(new Error('Failed to load GA4 script'))
			document.head.appendChild(s)
		})
	}

	static event(name: string, params?: Record<string, unknown>): void {
		if (!this.measurementId) {
			console.warn('[GA4] Not initialized')
			return
		}
		window.gtag('event' satisfies GtagCommand, name, params ?? {})
		console.log('[GA4] event', name, params)
	}

	static sendPageView(params?: { page_path?: string; page_title?: string }): void {
		if (!this.measurementId) {
			console.warn('[GA4] Not initialized')
			return
		}
		window.gtag('event' satisfies GtagCommand, 'page_view', params ?? {})
		console.log('[GA4] page_view', params)
	}

	static setUser(userId?: string): void {
		if (!this.measurementId) {
			console.warn('[GA4] Not initialized')
			return
		}
		if (userId) {
			window.gtag('set' satisfies GtagCommand, { user_id: userId })
			console.log('[GA4] set user_id', userId)
		}
	}

	static setUserProperties(props: Record<string, unknown>): void {
		if (!this.measurementId) {
			console.warn('[GA4] Not initialized')
			return
		}
		window.gtag('set' satisfies GtagCommand, 'user_properties', props)
		console.log('[GA4] set user_properties', props)
	}
}


