import React from 'react'
import OrderManagement from '@/components/shop/OrderManagement';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';

const OrderManagementPage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="grid grid-cols-12 w-full">
          <div className="lg:col-span-1 col-span-full bg-white">
            <ShopDashboardSideBar active={2} />
          </div>
          <div className="lg:col-span-11 col-span-full p-4">
            <OrderManagement />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderManagementPage

