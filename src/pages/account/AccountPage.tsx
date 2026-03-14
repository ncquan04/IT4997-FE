import { useState } from "react";
import CommonButton from "../../components/common/CommonButton";

const AccountPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveChanges = () => {
    //
  };

  return (
    <div className="w-full flex justify-center pt-20 pb-24 px-4 md:px-0">
      <div className="w-full max-w-[1170px] flex flex-col gap-10 md:gap-20">
        <div className="flex flex-col md:flex-row w-full gap-8 md:gap-[100px]">
          <aside className="flex flex-col gap-6 w-full md:w-[250px]">
            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-base text-black">
                Manage My Account
              </h3>
              <ul className="flex flex-col gap-2 pl-9">
                <li className="text-red-500 cursor-pointer">My Profile</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-medium text-base text-black">My Orders</h3>
              <ul className="flex flex-col gap-2 pl-9">
                <li className="text-gray-500 cursor-pointer hover:text-black">
                  My Returns
                </li>
                <li className="text-gray-500 cursor-pointer hover:text-black">
                  My Cancellations
                </li>
              </ul>
            </div>
          </aside>

          <section className="flex-1 shadow-[0px_1px_13px_0px_rgba(0,0,0,0.05)] p-6 md:p-20 rounded bg-white">
            <h2 className="text-xl font-medium text-red-500 mb-4">
              Edit Your Profile
            </h2>

            <form className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="firstName" className="text-base text-black">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="lastName" className="text-base text-black">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="email" className="text-base text-black">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <label htmlFor="address" className="text-base text-black">
                    Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-2 w-full">
                  <label className="text-base text-black">
                    Password Changes
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                    placeholder="Current Password"
                    aria-label="Current Password"
                  />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                  placeholder="New Password"
                  aria-label="New Password"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
                  placeholder="Confirm New Password"
                  aria-label="Confirm New Password"
                />
              </div>

              <div className="flex justify-end items-center gap-8 mt-4">
                <button type="button" className="text-black hover:text-red-500">
                  Cancel
                </button>
                <CommonButton
                  label="Save Changes"
                  onClick={handleSaveChanges}
                  className="!w-[214px] !h-[56px]"
                />
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
