import CreateProductForm from "@/components/shop/CreateProductForm";
// import EditProduct from "@/components/shop/EditProducts";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";

export default function EditProductPage() {
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="flex w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={3} />
          </div>
          <div className="flex-1 flex justify-center p-4">
           {/* <EditProduct /> */}
           <CreateProductForm />
          </div>
        </div>
      </div>
    </div>
  );
}
