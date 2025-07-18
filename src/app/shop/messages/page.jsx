import React from 'react'
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar'
import DashboardMessages from '@/components/shop/DsshboaardMessages'

const ShopInboxPage = () => {
  return (
    <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={8} />
          </div>
          <DashboardMessages />
        </div>
      </div>
  )
}

export default ShopInboxPage