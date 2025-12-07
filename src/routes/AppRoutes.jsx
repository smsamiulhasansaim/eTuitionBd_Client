import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import NotFound from "../pages/common/NotFound";
import Home from "../pages/dashboard/Home";


export const router = createBrowserRouter([
  {
    
    path: "/",
    Component: MainLayout,
    errorElement: <NotFound></NotFound>,
    children:[
        {
         path:"/",
         element: <Home></Home>
        },
        {
        
        }
    ]
  },
]);
