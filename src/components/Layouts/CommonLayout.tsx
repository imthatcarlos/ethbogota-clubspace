import Footer from "../Footer";
import { Header } from "../Header";

export const CommonLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default CommonLayout;
