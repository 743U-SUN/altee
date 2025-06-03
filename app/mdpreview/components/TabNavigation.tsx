'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit3, Eye } from 'lucide-react'
import { TabType } from '../types'

interface TabNavigationProps {
  currentTab: TabType
  onTabChange: (tab: TabType) => void
}

export function TabNavigation({ currentTab, onTabChange }: TabNavigationProps) {
  return (
    <Tabs value={currentTab} onValueChange={(value) => onTabChange(value as TabType)}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="edit" className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Edit
        </TabsTrigger>
        <TabsTrigger value="preview" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}