import { sendPublicDigest } from '../services/digest.service'

export async function runPublicDigest(): Promise<void> {
  console.log('Public digest starting...')
  await sendPublicDigest()
  console.log('Public digest complete')
}
