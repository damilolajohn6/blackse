import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';
import ViewEvent from '@/components/shop/ViewEvent';


const ViewEventPage = () => {
  return (
    <div>
      <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={5} />
          </div>
          <ViewEvent />
        </div>
      </div>
    </div>
  );
}

export default ViewEventPage