import type { Dispatch, SetStateAction } from "react";

interface InfoSectionProps {
  action: "login" | "signup";
  variant?: "card" | "desktop";
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  username?: string;
  setUsername?: Dispatch<SetStateAction<string>>;
  phoneNumber?: string;
  setPhoneNumber?: Dispatch<SetStateAction<string>>;
  dateOfBirth?: string;
  setDateOfBirth?: Dispatch<SetStateAction<string>>;
}

const InfoSection = (props: InfoSectionProps) => {
  const isSignup = props.action === "signup";
  const isCard = props.variant === "card";
  const inputClass = isCard
    ? "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-secondary2 focus:bg-white transition-colors"
    : "border-b border-text2 p-2 text-text2 focus:outline-none w-full";
  return (
    <fieldset
      className="w-full flex flex-col gap-3"
      aria-describedby="auth-helper"
    >
      <legend className="sr-only">
        {isSignup ? "Sign up" : "Log in"} details
      </legend>
      {isSignup && (
        <>
          <label htmlFor="username" className="sr-only">
            Name
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Họ và tên"
            autoComplete="name"
            className={inputClass}
            value={props.username}
            onChange={(e) =>
              props.setUsername && props.setUsername(e.target.value)
            }
          />
          <label htmlFor="phoneNumber" className="sr-only">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="Số điện thoại"
            autoComplete="tel"
            className={inputClass}
            value={props.phoneNumber}
            onChange={(e) =>
              props.setPhoneNumber && props.setPhoneNumber(e.target.value)
            }
          />
          <label htmlFor="dateOfBirth" className="sr-only">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            className={inputClass}
            value={props.dateOfBirth}
            onChange={(e) =>
              props.setDateOfBirth && props.setDateOfBirth(e.target.value)
            }
          />
        </>
      )}
      <label htmlFor="email" className="sr-only">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email"
        autoComplete={isSignup ? "email" : "username"}
        className={inputClass}
        value={props.email}
        onChange={(e) => props.setEmail && props.setEmail(e.target.value)}
        required
      />
      <label htmlFor="password" className="sr-only">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Mật khẩu"
        autoComplete={isSignup ? "new-password" : "current-password"}
        className={inputClass}
        value={props.password}
        onChange={(e) => props.setPassword && props.setPassword(e.target.value)}
        required
      />
      <p id="auth-helper" className="sr-only">
        All fields marked required must be completed.
      </p>
    </fieldset>
  );
};

export default InfoSection;
