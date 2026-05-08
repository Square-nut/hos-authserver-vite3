import { defineStore } from 'pinia'

type DeviceState = {
  ip: string
  mac: string
  hostName: string
  isOpenDb: boolean
}

export const useDeviceStore = defineStore('device', {
  state: (): DeviceState => ({
    ip: '',
    mac: '',
    hostName: '',
    isOpenDb: false,
  }),
  actions: {
    setDeviceInfo(payload: Partial<DeviceState>) {
      if (typeof payload.ip === 'string') this.ip = payload.ip
      if (typeof payload.mac === 'string') this.mac = payload.mac
      if (typeof payload.hostName === 'string') this.hostName = payload.hostName
      if (typeof payload.isOpenDb === 'boolean') this.isOpenDb = payload.isOpenDb
    },
    setOpenDbEnabled(enabled: boolean) {
      this.isOpenDb = enabled
    },
  },
  persist: {
    key: 'device-info',
    storage: localStorage,
    pick: ['ip', 'mac', 'hostName', 'isOpenDb'],
  },
})
