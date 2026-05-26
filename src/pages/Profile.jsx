import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Loader2, CheckCircle2, User, Mail, Phone, Lock, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import PasswordInput from '../components/auth/PasswordInput'
import PasswordStrengthBar from '../components/auth/PasswordStrengthBar'
import { getPasswordStrength } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, updateProfile, updatePassword, uploadAvatar, signOut } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [info, setInfo] = useState({ full_name: '', phone: '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [passErrors, setPassErrors] = useState({})
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    if (profile) setInfo({ full_name: profile.full_name || '', phone: profile.phone || '' })
  }, [profile])

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    if (!info.full_name.trim()) { toast.error('Name is required'); return }
    setSavingInfo(true)
    try {
      await updateProfile(info)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Update failed')
    } finally {
      setSavingInfo(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!passwords.newPass || passwords.newPass.length < 8) errs.newPass = 'At least 8 characters required'
    if (passwords.newPass !== passwords.confirm) errs.confirm = 'Passwords do not match'
    if (getPasswordStrength(passwords.newPass).score < 2) errs.newPass = 'Password is too weak'
    if (Object.keys(errs).length) { setPassErrors(errs); return }
    setSavingPass(true)
    try {
      await updatePassword(passwords.newPass)
      setPasswords({ current: '', newPass: '', confirm: '' })
      toast.success('Password updated!')
    } catch (err) {
      toast.error(err.message || 'Password update failed')
    } finally {
      setSavingPass(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    setUploadingAvatar(true)
    try {
      await uploadAvatar(file)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    toast.success('Signed out')
  }

  const avatarUrl = profile?.avatar_url
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const setPass = (k) => (e) => { setPasswords(p => ({ ...p, [k]: e.target.value })); setPassErrors(er => ({ ...er, [k]: '' })) }

  return (
    <div className="max-w-2xl space-y-5 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-primary">Profile</h1>
        <p className="text-secondary text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar + name header */}
      <div className="card flex flex-col sm:flex-row items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/20 flex items-center justify-center text-2xl font-bold text-brand-400 overflow-hidden">
            {avatarUrl
              ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              : initials}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-glow hover:bg-brand-600 transition-colors"
          >
            {uploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">{displayName}</h2>
          <p className="text-secondary text-sm">{user?.email}</p>
          <p className="text-xs text-muted mt-1">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Edit info */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-brand-400" />
          <h3 className="font-semibold text-primary">Personal Information</h3>
        </div>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" value={info.full_name} onChange={e => setInfo(i => ({ ...i, full_name: e.target.value }))}
              placeholder="Your full name" className="input" />
          </div>
          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="email" value={user?.email || ''} disabled className="input pl-9 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-muted mt-1">Email cannot be changed here</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="tel" value={info.phone} onChange={e => setInfo(i => ({ ...i, phone: e.target.value }))}
                placeholder="9876543210" className="input pl-9" />
            </div>
          </div>
          <motion.button type="submit" disabled={savingInfo} whileTap={{ scale: 0.98 }}
            className="btn-primary">
            {savingInfo ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Save Changes</>}
          </motion.button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-brand-400" />
          <h3 className="font-semibold text-primary">Change Password</h3>
        </div>
        <form onSubmit={handleSavePassword} className="space-y-4">
          <PasswordInput id="newPass" label="New Password" value={passwords.newPass}
            onChange={setPass('newPass')} error={passErrors.newPass} placeholder="Min. 8 characters" />
          <PasswordStrengthBar password={passwords.newPass} />
          <PasswordInput id="confirmPass" label="Confirm New Password" value={passwords.confirm}
            onChange={setPass('confirm')} error={passErrors.confirm} />
          <motion.button type="submit" disabled={savingPass} whileTap={{ scale: 0.98 }}
            className="btn-primary">
            {savingPass ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={16} /> Update Password</>}
          </motion.button>
        </form>
      </div>

      {/* Sign out */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="font-medium text-primary">Sign out</p>
          <p className="text-sm text-secondary">Sign out from all devices</p>
        </div>
        <button onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold transition-colors">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  )
}
