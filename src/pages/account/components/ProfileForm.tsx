import { useState } from "react";
import CommonButton from "../../../components/common/CommonButton";

const ProfileForm = () => {
  const [firstName, setFirstName] = useState("Md");
  const [lastName, setLastName] = useState("Rimel");
  const [email, setEmail] = useState("rimel1111@gmail.com");
  const [address, setAddress] = useState("Kingston, 5236, United State");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="flex-1 shadow-[0px_1px_13px_0px_rgba(0,0,0,0.05)] p-20 rounded bg-white">
      <h2 className="text-xl font-medium text-red-500 mb-4">
        Edit Your Profile
      </h2>

      <form className="flex flex-col gap-6">
        <div className="flex gap-12 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base text-black">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
              placeholder="Md"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base text-black">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
              placeholder="Rimel"
            />
          </div>
        </div>

        <div className="flex gap-12 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base text-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
              placeholder="rimel1111@gmail.com"
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base text-black">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
              placeholder="Kingston, 5236, United State"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-base text-black">Password Changes</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
              placeholder="Current Password"
            />
          </div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
            placeholder="New Password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-[50px] bg-secondary rounded px-4 outline-none text-black placeholder:text-gray-400"
            placeholder="Confirm New Password"
          />
        </div>

        <div className="flex justify-end items-center gap-8 mt-4">
          <button type="button" className="text-black hover:text-red-500">
            Cancel
          </button>
          <CommonButton
            label="Save Changes"
            onClick={() => {}}
            className="!w-[214px] !h-[56px]"
          />
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
