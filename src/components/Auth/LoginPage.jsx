import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  async function onSubmit({ email, password }) {
    if (modo === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error('Email ou senha incorrectos.'); return }
      toast.success('Bem-vindo!')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { toast.error('Erro: ' + error.message); return }
      toast.success('Conta criada! Verifique o seu email para confirmar.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 mb-4 shadow-lg shadow-amber-500/30">
            <span className="text-2xl font-black text-slate-900">Q</span>
          </div>
          <h1 className="text-3xl font-black text-amber-400 tracking-wide">QUINDEMBA</h1>
          <p className="text-slate-400 mt-1 text-sm">Sistema de Gestão de Recauchutagem</p>
        </div>

        {/* Card */}
        <div className="card shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 text-center">
            {modo === 'login' ? 'Entrar na conta' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="label">Email</label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="utilizador@exemplo.com"
                {...register('email', { required: 'Email é obrigatório' })}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary justify-center py-3 mt-2"
            >
              {isSubmitting ? (
                <span className="animate-spin">⟳</span>
              ) : modo === 'login' ? (
                <><LogIn size={16} /> Entrar</>
              ) : (
                <><UserPlus size={16} /> Criar conta</>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
              className="text-sm text-slate-400 hover:text-amber-400 transition-colors"
            >
              {modo === 'login'
                ? 'Não tem conta? Criar uma →'
                : '← Já tem conta? Entrar'
              }
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Quindemba &copy; {new Date().getFullYear()} · Gestão de Recauchutagem
        </p>
      </div>
    </div>
  )
}
