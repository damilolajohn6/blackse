import CreateProductForm from '@/components/shop/CreateProductForm';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';
import React from 'react'

const ShopCreateProductPage = () => {
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="grid grid-cols-12 w-full">
          <div className="lg:col-span-1 col-span-full bg-white">
            <ShopDashboardSideBar active={4} />
          </div>
          <div className="lg:col-span-11 col-span-full p-4">
            <CreateProductForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopCreateProductPage