import React from 'react'
import OrderManagement from '@/components/shop/OrderManagement';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';

const OrderManagementPage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="flex w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={2} />
          </div>
          <div className="flex-1 flex justify-center p-4">
            <OrderManagement />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderManagementPage

