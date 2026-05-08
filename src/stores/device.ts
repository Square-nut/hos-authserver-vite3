import { defineStore } from 'pinia'

type DeviceState = {
  ip: string
  mac: string
  hostName: string
}

export const useDeviceStore = defineStore('device', {
  state: (): DeviceState => ({
    ip: '',
    mac: '',
    hostName: '',
  }),
  actions: {
    setDeviceInfo(payload: Partial<DeviceState>) {
      if (typeof payload.ip === 'string') this.ip = payload.ip
      if (typeof payload.mac === 'string') this.mac = payload.mac
      if (typeof payload.hostName === 'string') this.hostName = payload.hostName
    },
  },
  persist: {
    key: 'device-info',
    storage: localStorage,
    pick: ['ip', 'mac', 'hostName'],
  },
})
