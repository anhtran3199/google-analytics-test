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
	private static fixedSessionId: number | null = null
	private static readonly SESSION_STORAGE_KEY = 'ga4tester_session_id'
	private static newUserPerEvent = false

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
		if (this.newUserPerEvent) {
			this.applyNewClientId()
		}
		const payload = { ...(params ?? {}) }
		if (this.fixedSessionId) {
			payload['session_id'] = this.fixedSessionId
		}
		window.gtag('event' satisfies GtagCommand, name, payload)
		console.log('[GA4] event', name, payload)
	}

	static sendPageView(params?: { page_path?: string; page_title?: string }): void {
		if (!this.measurementId) {
			console.warn('[GA4] Not initialized')
			return
		}
		if (this.newUserPerEvent) {
			this.applyNewClientId()
		}
		const payload = { ...(params ?? {}) }
		if (this.fixedSessionId) {
			payload['session_id'] = this.fixedSessionId
		}
		window.gtag('event' satisfies GtagCommand, 'page_view', payload)
		console.log('[GA4] page_view', payload)
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

	static setNewUserPerEvent(enabled: boolean): void {
		this.newUserPerEvent = enabled
		console.log('[GA4] newUserPerEvent', enabled)
	}

	private static applyNewClientId(): void {
		if (!this.measurementId) return
		const newCid = this.generateClientId()
		try {
			// Reconfigure with a fresh client_id so the next hit is treated as a new user
			window.gtag('config' satisfies GtagCommand, this.measurementId, { client_id: newCid })
			console.log('[GA4] applied new client_id', newCid)
		} catch (e) {
			console.warn('[GA4] failed to apply new client_id', e)
		}
	}

	private static generateClientId(): string {
		const now = Date.now()
		const rand = Math.floor(Math.random() * 1_000_000_000)
		return `${now}.${rand}`
	}

	static enableFixedSession(): void {
		const stored = localStorage.getItem(this.SESSION_STORAGE_KEY)
		if (stored) {
			const id = Number(stored)
			if (!Number.isNaN(id)) {
				this.fixedSessionId = id
				console.log('[GA4] fixed session_id restored', id)
				return
			}
		}
		const nowSeconds = Math.floor(Date.now() / 1000)
		this.fixedSessionId = nowSeconds
		localStorage.setItem(this.SESSION_STORAGE_KEY, String(nowSeconds))
		console.log('[GA4] fixed session_id set', nowSeconds)
	}

	static disableFixedSession(): void {
		this.fixedSessionId = null
		localStorage.removeItem(this.SESSION_STORAGE_KEY)
		console.log('[GA4] fixed session_id disabled')
	}

	static getClientId(): Promise<string | null> {
		return new Promise((resolve) => {
			if (!this.measurementId || !window.gtag) {
				resolve(null)
				return
			}
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(window as any).gtag('get', this.measurementId, 'client_id', (clientId: string) => {
					resolve(clientId || null)
				})
			} catch {
				resolve(null)
			}
		})
	}
}


