import CreateProductForm from '@/components/shop/CreateProductForm';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';
import React from 'react'

const ShopCreateProductPage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="flex w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={4} />
          </div>
          <div className="flex-1 flex justify-center p-4">
            <CreateProductForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopCreateProductPage