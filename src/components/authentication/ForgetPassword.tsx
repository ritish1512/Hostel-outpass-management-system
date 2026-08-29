'use client' 

import CreateForgetPassword from "@/app/actions/forgotPasswordRequest"; 
import { useState } from "react" 

export default function ForgetPassword(){ 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmission = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true); 
    try {
      await CreateForgetPassword(email, password);
    } catch (error) { 
      alert("An unexpected error occurred"); 
    } finally {
      setLoading(false);
    }
  } 

  return ( 
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your details below to request a password change.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmission}> 
          <div className="space-y-4">
            <div> 
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label> 
              <input 
                type="email" 
                id="email" 
                required
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                placeholder="you@example.com"
              /> 
            </div> 

            <div> 
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label> 
              {/* Relative wrapper allows button positioning inside the input boundary */}
              <div className="relative mt-1">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="block w-full rounded-lg border border-gray-300 pl-3 pr-16 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                  placeholder="••••••••"
                /> 
                <button
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors duration-150"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <span className="mt-1.5 block text-xs text-gray-500">
                Must contain: 6 characters, a symbol, and a number
              </span> 
            </div> 
          </div>

          <div>
            <button 
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? "Processing..." : "Request Reset"}
            </button> 
          </div>
        </form> 
      </div> 
    </div> 
  ) 
}
