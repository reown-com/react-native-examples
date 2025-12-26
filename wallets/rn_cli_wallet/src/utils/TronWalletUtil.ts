import TronLib from '../lib/TronLib'
import { storage } from './storage'

export let tronWeb1: TronLib
export let tronWeb2: TronLib
export let tronWallets: Record<string, TronLib>
export let tronAddresses: string[]

let address1: string

/**
 * Utilities
 */
export async function createOrRestoreTronWallet() {
  const privateKey1 = await storage.getItem('TRON_PrivateKey_1')

  if (privateKey1) {
    tronWeb1 = await TronLib.init({ privateKey: privateKey1 })
  } else {
    tronWeb1 = await TronLib.init({ privateKey: '' })

    // Don't store privateKey in local storage in a production project!
    storage.setItem('TRON_PrivateKey_1', tronWeb1.privateKey)
  }

  address1 = tronWeb1.getAddress() as string

  tronWallets = {
    [address1]: tronWeb1,
  }

  tronAddresses = Object.keys(tronWallets)

  return {
    tronWallets,
    tronAddresses
  }
}
