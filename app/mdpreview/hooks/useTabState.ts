'use client'

import { useQueryState } from 'nuqs'
import { TabType } from '../types'

export function useTabState() {
  const [tab, setTab] = useQueryState('tab', {
    defaultValue: 'edit' as TabType,
    parse: (value): TabType => {
      return value === 'preview' ? 'preview' : 'edit'
    },
    serialize: (value: TabType) => value
  })

  return {
    currentTab: tab,
    setCurrentTab: setTab,
    isEditMode: tab === 'edit',
    isPreviewMode: tab === 'preview'
  }
}