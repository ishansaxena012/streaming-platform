import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { loginSchema } from "../schemas/auth.schema";
import type { LoginInput } from "../schemas/auth.schema";
import { useAuthStore } from "../../../store/auth.store";
import { ROUTES } from "../../../config/routes";
import { apiClient } from "../../../services/api-client";
import { bootstrapSession } from "../lib/bootstrap-session";
import { Loader2, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BackendAuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    subscriptionPlan: "FREE" | "PREMIUM";
    subscriptionExpiresAt: string | null;
    createdAt: string;
  };
}

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await apiClient.post<BackendAuthResponse>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const result = response as unknown as BackendAuthResponse;

      const mappedUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        subscriptionActive: result.user.subscriptionPlan === "PREMIUM",
        createdAt: result.user.createdAt,
      };

      const { refreshToken, profiles } = bootstrapSession(mappedUser);
      login(mappedUser, result.token, refreshToken, profiles);

      toast.success(`Welcome back, ${mappedUser.name}!`);
      navigate(ROUTES.PROFILES);
    } catch (error: any) {
      console.error("Login failed:", error);
      toast.error(error.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6 select-none"
    >
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-bold tracking-wide text-white">Sign In</h2>
        <p className="text-xs text-cinema-gray">Welcome back to Marquee</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cinema-gray group-focus-within:text-netflix-red transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            {...register("email")}
            placeholder="Email address"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-cinema-gray focus:outline-none focus:border-netflix-red focus:bg-white/[0.08] transition-all"
          />
          {errors.email && (
            <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email.message}</p>
          )}
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cinema-gray group-focus-within:text-netflix-red transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            {...register("password")}
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-cinema-gray focus:outline-none focus:border-netflix-red focus:bg-white/[0.08] transition-all"
          />
          {errors.password && (
            <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.password.message}</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-netflix-red hover:bg-red-700 active:scale-98 transition-all text-white font-bold text-xs cursor-pointer shadow-lg shadow-netflix-red/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>

      <div className="text-center pt-2">
        <p className="text-cinema-gray text-xs">
          New to Marquee?{" "}
          <Link to={ROUTES.REGISTER} className="text-white font-bold hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
export default LoginForm;
