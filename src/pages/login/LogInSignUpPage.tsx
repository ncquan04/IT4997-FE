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

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = location.state?.from;
  const fromPath = fromLocation?.pathname || AppRoutes.HOME;
  const fromState = fromLocation?.state;

  useEffect(() => {
    const handleLoginRedirect = async () => {
      if (isAuthenticated) {
        if (user?.role === UserRole.ADMIN) {
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
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  const handleSignUp = async (
    username: string,
    email: string,
    password: string,
    phoneNumber: string,
    dateOfBirth: string
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
    } catch (err: any) {
      setError(err.message || "Registration failed");
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
        className="w-full h-full pt-12 pb-12 pl-6 pr-6 flex flex-row justify-between items-center overflow-hidden"
      >
        <AnimatePresence mode="wait">
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
            <Header action={props.action} />
            <form
              className="w-full flex flex-col gap-8"
              onSubmit={handleSubmit}
              noValidate
            >
              <InfoSection
                action={props.action}
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
                handleLogIn={() => handleLogin(email, password)}
                handleSignUp={() =>
                  handleSignUp(
                    username,
                    email,
                    password,
                    phoneNumber,
                    dateOfBirth
                  )
                }
              />
            </form>
          </motion.section>
        </AnimatePresence>
      </main>
    </PageTransition>
  );
};

export default LogInSignUpPage;
