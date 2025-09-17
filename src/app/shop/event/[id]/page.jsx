import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';
import ViewEvent from '@/components/shop/ViewEvent';


const ViewEventPage = async ({ params }) => {
  console.log("ViewEventPage params:", params);
  
  // Await the params to get the actual values
  const resolvedParams = await params;
  
  return (
    <div>
      <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={5} />
          </div>
          <ViewEvent eventId={resolvedParams?.id} />
        </div>
      </div>
    </div>
  );
}

export default ViewEventPage