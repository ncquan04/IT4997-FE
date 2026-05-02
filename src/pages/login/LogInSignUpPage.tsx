import PageTransition from "../../components/common/PageTransition";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import InfoSection from "./components/InfoSection";
import ActionSection from "./components/ActionSection";
import { useAuth } from "../../contexts/AuthContext";
import { AppRoutes } from "../../navigation";
import { UserRole } from "../../shared/models/user-model";
import { logEvent } from "../../utils/analytics";

interface LogInSignUpPageProps {
  action: "login" | "signup";
}

const LogInSignUpPage = (props: LogInSignUpPageProps) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
  }, [props.action]);

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = location.state?.from;
  const fromPath = fromLocation?.pathname || AppRoutes.HOME;
  const fromState = fromLocation?.state;

  useEffect(() => {
    const handleLoginRedirect = async () => {
      if (isAuthenticated) {
        const staffRoles: string[] = [
          UserRole.ADMIN,
          UserRole.MANAGER,
          UserRole.WAREHOUSE,
          UserRole.SALES,
          UserRole.TECHNICIAN,
        ];

        if (user?.role && staffRoles.includes(user.role)) {
          navigate(AppRoutes.ADMIN, { replace: true });
          return;
        }

        if (location.state?.action === "addToCart" && location.state?.payload) {
          const { productId, variantId, quantity } = location.state.payload;
          try {
            const { addToCart } = await import("../../services/api/api.cart");
            await addToCart(productId, variantId, quantity);

            navigate(AppRoutes.CART, { replace: true });
          } catch (error) {
            console.error("Failed to add to cart after login:", error);
            navigate(fromPath, { replace: true, state: fromState });
          }
        } else {
          navigate(fromPath, { replace: true, state: fromState });
        }
      }
    };

    handleLoginRedirect();
  }, [isAuthenticated, fromPath, fromState, location.state, user]);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setError("");
      await login(email, password);
      logEvent("login", { method: "email" });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
      setError(message);
      logEvent("login_failed", { method: "email", error: message });
    }
  };

  const handleSignUp = async (
    username: string,
    email: string,
    password: string,
    phoneNumber: string,
    dateOfBirth: string,
  ) => {
    if (!username || !email || !password || !phoneNumber || !dateOfBirth) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setError("");
      await register({
        username,
        email,
        password,
        phoneNumber,
        dateOfBirth,
      });
      await login(email, password);
      logEvent("sign_up", { method: "email" });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Đăng ký thất bại";
      setError(message);
      logEvent("sign_up_failed", { method: "email", error: message });
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (props.action === "login") {
      handleLogin(email, password);
    } else {
      handleSignUp(username, email, password, phoneNumber, dateOfBirth);
    }
  };

  return (
    <PageTransition>
      <main
        role="main"
        className="w-full min-h-screen flex items-center justify-center bg-gray-50 md:bg-white px-4 py-12 md:px-0 md:py-0 overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {/* ── Mobile: centered card ── */}
          <motion.div
            key={props.action + "-mobile"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="md:hidden w-full max-w-md bg-white rounded-2xl shadow-lg px-8 py-10 flex flex-col gap-6"
          >
            <div className="flex justify-center">
              <img
                src="/icon.jpg"
                alt="Apex logo"
                className="w-16 h-16 object-contain rounded-xl"
              />
            </div>
            <Header action={props.action} variant="card" />
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <InfoSection
                action={props.action}
                variant="card"
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                username={username}
                setUsername={setUsername}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                dateOfBirth={dateOfBirth}
                setDateOfBirth={setDateOfBirth}
              />
              {error && (
                <p className="text-sm text-red-500 text-center -mt-1">
                  {error}
                </p>
              )}
              <ActionSection
                action={props.action}
                variant="card"
                handleLogIn={() => handleLogin(email, password)}
                handleSignUp={() =>
                  handleSignUp(
                    username,
                    email,
                    password,
                    phoneNumber,
                    dateOfBirth,
                  )
                }
              />
            </form>
          </motion.div>

          {/* ── Desktop: original two-column layout ── */}
          <div className="hidden md:flex w-full h-screen">
            <motion.aside
              key={props.action + "-aside"}
              initial={{ x: props.action === "login" ? -100 : 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: props.action === "login" ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-1/2 h-full flex flex-col justify-center items-center gap-6"
              aria-label="Branding"
            >
              <figure className="w-full flex justify-center">
                <img src="/icon.jpg" alt="Apex logo" className="w-1/2 h-auto" />
              </figure>
            </motion.aside>
            <motion.section
              key={props.action + "-section"}
              initial={{ x: props.action === "login" ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: props.action === "login" ? 100 : -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-1/2 pr-24 h-full flex flex-col justify-center items-center gap-12"
              aria-labelledby="auth-heading"
            >
              <Header action={props.action} variant="desktop" />
              <form
                className="w-full flex flex-col gap-8"
                onSubmit={handleSubmit}
                noValidate
              >
                <InfoSection
                  action={props.action}
                  variant="desktop"
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  username={username}
                  setUsername={setUsername}
                  phoneNumber={phoneNumber}
                  setPhoneNumber={setPhoneNumber}
                  dateOfBirth={dateOfBirth}
                  setDateOfBirth={setDateOfBirth}
                />
                {error && <p className="text-button2 text-center">{error}</p>}
                <ActionSection
                  action={props.action}
                  variant="desktop"
                  handleLogIn={() => handleLogin(email, password)}
                  handleSignUp={() =>
                    handleSignUp(
                      username,
                      email,
                      password,
                      phoneNumber,
                      dateOfBirth,
                    )
                  }
                />
              </form>
            </motion.section>
          </div>
        </AnimatePresence>
      </main>
    </PageTransition>
  );
};

export default LogInSignUpPage;
