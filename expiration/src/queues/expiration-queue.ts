import Queue from 'bull'

interface ExpirationPayload {
  orderId: string;
}

const expirationQueue = new Queue<ExpirationPayload>('order:expiration', {
  redis: {
    host: process.env.REIDS_HOST
  }
})

expirationQueue.process(async (job) => {
  console.log("will publish an expiration:complete event for orderId", job.data.orderId)
})

export { expirationQueue }