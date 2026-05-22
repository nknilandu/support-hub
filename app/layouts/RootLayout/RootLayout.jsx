import { Outlet } from "react-router";
import Navbar from "../../../components/Navbar/Navbar";
import Footer from "../../../components/Footer/Footer";
import ScrollToTop from "../../../components/ScrollToTop/ScrollToTop";

const RootLayout = () => {
  return (
    <div className="bg-base-200 min-h-screen">
      <Navbar></Navbar>
      <Outlet></Outlet>
      <Footer></Footer>
      <ScrollToTop></ScrollToTop>
    </div>
  );
};

export default RootLayout;
