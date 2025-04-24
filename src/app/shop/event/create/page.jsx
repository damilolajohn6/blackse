import React from 'react'
import CreateEventForm from '@/components/shop/CreateEvent';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';

const CreatEventPage = () => {
  return (
    <div>
      <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={6} />
          </div>
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}

export default CreatEventPage