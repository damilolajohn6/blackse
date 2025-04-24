import EditEvent from '@/components/shop/EditEvent';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';
import React from 'react'

const EditEventPage = () => {
  return (
    <div>
      <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={5} />
          </div>
          <EditEvent />
        </div>
      </div>
    </div>
  );
}

export default EditEventPage