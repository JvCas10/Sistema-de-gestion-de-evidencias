import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="w-full px-4 md:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;