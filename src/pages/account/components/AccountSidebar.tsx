const AccountSidebar = () => {
  return (
    <div className="flex flex-col gap-6 w-[250px]">
      <div className="flex flex-col gap-4">
        <h3 className="font-medium text-base text-black">Manage My Account</h3>
        <div className="flex flex-col gap-2 pl-9">
          <span className="text-red-500 cursor-pointer">My Profile</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSidebar;
