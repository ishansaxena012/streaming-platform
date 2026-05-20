import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { registerSchema } from "../schemas/auth.schema";
import type { RegisterInput } from "../schemas/auth.schema";
import { useAuthStore } from "../../../store/auth.store";
import { ROUTES } from "../../../config/routes";
import { APP_CONSTANTS } from "../../../config/constants";
import { apiClient } from "../../../services/api-client";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BackendRegisterResponse {
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

export function RegisterForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const response = await apiClient.post<BackendRegisterResponse>("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const result = response as unknown as BackendRegisterResponse;
      
      const mappedUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        subscriptionActive: result.user.subscriptionPlan === "PREMIUM",
        createdAt: result.user.createdAt,
      };

      // Provision initial browser profile slots matching the new user's credentials
      const userProfiles = [
        { 
          id: "prof-primary", 
          name: mappedUser.name, 
          avatarUrl: APP_CONSTANTS.DEFAULT_AVATARS[0].url, 
          isKids: false 
        },
        { 
          id: "prof-kids", 
          name: "Kids Zone", 
          avatarUrl: APP_CONSTANTS.DEFAULT_AVATARS[2].url, 
          isKids: true 
        },
      ];

      // Automatically sign in the newly registered account
      login(mappedUser, result.token, "mock-refresh-token-" + Math.random().toString(36).substring(7), userProfiles);
      
      toast.success("Account created successfully!");
      navigate(ROUTES.PROFILES);
    } catch (error: any) {
      console.error("Registration failure:", error);
      toast.error(error.message || "Could not register account. Check connection or verify if email exists.");
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
        <h2 className="text-2xl font-bold tracking-wide text-white">Create Account</h2>
        <p className="text-xs text-cinema-gray">Join Portal and stream movies in Ultra HD</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cinema-gray group-focus-within:text-netflix-red transition-colors">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            {...register("name")}
            placeholder="Full name"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-cinema-gray focus:outline-none focus:border-netflix-red focus:bg-white/[0.08] transition-all"
          />
          {errors.name && (
            <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
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

        {/* Confirm Password Field */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cinema-gray group-focus-within:text-netflix-red transition-colors">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type="password"
            {...register("confirmPassword")}
            placeholder="Confirm password"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-cinema-gray focus:outline-none focus:border-netflix-red focus:bg-white/[0.08] transition-all"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Onboard */}
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
            "Create Account"
          )}
        </motion.button>
      </form>

      <div className="text-center pt-2">
        <p className="text-cinema-gray text-xs">
          Already have an account?{" "}
          <Link to={ROUTES.LOGIN} className="text-white font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
export default RegisterForm;
