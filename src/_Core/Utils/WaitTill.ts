Promise.prototype.cancelled = false
Promise.prototype.cancel = function () {
	this.cancelled = true
}

export function waitTill(condition: (() => any), timeout: number = Infinity, callback: ((conditionResult: any) => {}) | null = null) {

	const promise = new Promise<any>((resolve, reject) => {
		let startTime = performance.now()

		const checkCondition = () => {

			if (promise.cancelled) {
				reject("Cancelled")
				return
			}

			if (condition()) {
				if (callback) resolve(callback(condition()))
				else resolve(condition())
				return
			}

			const currentTime = performance.now()
			const elapsedTime = currentTime - startTime

			if (elapsedTime >= timeout) {
				reject("Timeout")
				return
			}

			requestAnimationFrame(checkCondition)
		}

		requestAnimationFrame(checkCondition)
	})

	return promise
}