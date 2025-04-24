import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar'
import WithdrawalHistory from '@/components/shop/WithdrawalHistory'
import WithdrawRequest from '@/components/shop/WithdrawRequest'


const WithdrawPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
          <div className="flex flex-col md:flex-row w-full">
            {/* Sidebar */}
            <div className="w-full md:w-[100px] lg:w-[100px] border-b md:border-b-0 md:border-r border-gray-200">
              <ShopDashboardSideBar active={7} />
            </div>
    
            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6">
              <WithdrawRequest />
              <div className="">
                <WithdrawalHistory />
              </div>
            </div>
          </div>
        </div>
  )
}

export default WithdrawPage