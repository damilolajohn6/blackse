import React from 'react'
import EventList from '@/components/shop/EventList';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';
import EventManagementDashboard from '@/components/shop/EventManagementDashboard';

const EventPage = () => {
  return (
    <div>
      <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={5} />
          </div>
          <div className="w-full">
            <EventManagementDashboard />
            <EventList />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventPage