type QueueResolver = {
  resolve: (accessToken: string) => void
  reject: (error: unknown) => void
}

const waitingRequests: QueueResolver[] = []

export function waitForTokenRefresh() {
  return new Promise<string>((resolve, reject) => {
    waitingRequests.push({ resolve, reject })
  })
}

export function resolveWaitingRequests(accessToken: string) {
  while (waitingRequests.length) {
    const request = waitingRequests.shift()
    request?.resolve(accessToken)
  }
}

export function rejectWaitingRequests(error: unknown) {
  while (waitingRequests.length) {
    const request = waitingRequests.shift()
    request?.reject(error)
  }
}

export function getWaitingRequestCount() {
  return waitingRequests.length
}
