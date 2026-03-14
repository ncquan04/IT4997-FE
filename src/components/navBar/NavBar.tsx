import Header from "./components/Header";
import TopHeader from "./components/TopHeader";

const NavBar = () => {
  return (
    <header
      className="flex flex-col"
      style={{ borderBottom: "1px solid var(--color-gray-300)" }}
      role="banner"
    >
      <TopHeader />
      <Header />
    </header>
  );
};

export default NavBar;
