import hotkeys from 'hotkeys-js'

export const useHotkeys = (keys: string, callback: CallableFunction) => {
  hotkeys.filter = () => true
  hotkeys(keys, (e: Event) => {
    e.preventDefault()
    callback(e)
    return false
  })
}

export const removeAllHotkeys = () => {
  hotkeys.unbind()
}

interface IUseHotKeysV2Options {
  filter?: (event: KeyboardEvent) => boolean
}

export const useHotKeysV2 = (options: IUseHotKeysV2Options) => {
  function registerHotKeys(keys: string, callback: CallableFunction) {
    hotkeys.filter = options?.filter || (() => true)
    hotkeys(keys, (e: Event) => {
      e.preventDefault()
      callback()
      return false
    })
  }

  function removeAllHotkeys() {
    hotkeys.unbind()
  }

  onBeforeUnmount(() => {
    hotkeys.unbind()
  })

  return {
    registerHotKeys,
    removeAllHotkeys,
  }
}
