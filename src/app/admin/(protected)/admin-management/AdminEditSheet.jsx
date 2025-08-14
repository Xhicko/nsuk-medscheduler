'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader,SheetFooter ,SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FloatingLabelInput } from '@/components/custom/floating-label-input'
import { Mail, KeyRound, Hash, User2, ShieldCheck, Settings, UserCheck, UserPlus, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

export function AdminEditSheet({
  isOpen,
  onOpenChange,
  admin,
  formData,
  focusStates,
  errors,
  saveLoading,
  onFormChange,
  onSelectChange,
  setFocusState,
  isFieldValid,
  onSave,
  onSubmit,
  // verification props
  emailVerified,
  verificationToken,
  isSendLoading,
  isVerifyLoading,
  isResendLoading,
  resendCountdown,
  onSendToken,
  onResendToken,
  onVerifyToken,
  setVerificationToken,
  // optional: pending state for UI display
  pendingAdminId,
  pendingAdminEmail,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-2xl px-4">
        <SheetHeader className="sticky top-0 z-230 bg-white pb-4 md:pb-6 border-b border-gray-100">
          <div className="flex items-start gap-3 md:gap-4">
            <div className={`shrink-0 p-2.5 rounded-xl ring-1 ${admin ? 'bg-amber-50 ring-amber-100' : 'bg-blue-50 ring-blue-100'}`}>
              {admin ? (
                <UserCog className="w-5 h-5 text-amber-600" />
              ) : (
                <UserPlus className="w-5 h-5 text-[#0077B6]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl md:text-2xl font-bold text-gray-900">
                  {admin ? 'Edit Admin' : 'Add New Admin'}
                </SheetTitle>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${admin ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-blue-50 text-[#005a8a] ring-blue-200'}`}
                >
                  {admin ? 'Edit Mode' : 'Create Mode'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                {admin
                  ? 'Update admin account details and permissions'
                  : 'Create a new admin account with proper verification'}
              </p>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-10 px-1 pt-6">
          {/* Email Verification Section - Only for new admins */}
          {!admin && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Mail className="w-6 h-6 text-[#0077B6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Verification</h3>
                  <p className="text-sm text-gray-600 mt-1">Verify email address to proceed with account creation</p>
                </div>
              </div>

              <div className="p-8 border border-gray-200 rounded-2xl bg-gradient-to-br from-blue-50/50 to-white space-y-6">
                <div className="space-y-4">
                  <FloatingLabelInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData?.email || ''}
                    onChange={onFormChange}
                    icon={<Mail className="w-4 h-4" />}
                    isFocused={focusStates?.email}
                    setIsFocused={(f) => setFocusState('email', f)}
                    isValid={isFieldValid?.('email')}
                    errors={errors?.email}
                    placeholder=""
                  />

                  {pendingAdminId && (
                    <div className="text-xs text-gray-600 bg-white border rounded-xl p-3">
                      <div className="font-medium">Pending Verification</div>
                      <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div><span className="text-gray-500">Admin ID:</span> <span className="font-mono">{pendingAdminId}</span></div>
                        <div><span className="text-gray-500">Email:</span> <span className="font-mono">{pendingAdminEmail || formData?.email}</span></div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={onSendToken}
                      disabled={isSendLoading}
                      className="flex-1 h-12 bg-[#0077B6] hover:bg-[#005a8a] text-white font-medium cursor-pointer"
                    >
                      {isSendLoading ? 'Sending Token...' : 'Send Verification Token'}
                    </Button>
                    {resendCountdown > 0 ? (
                      <div className="flex items-center px-4 text-sm text-gray-500 bg-gray-100 rounded-lg">
                        Resend in {resendCountdown}s
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onResendToken}
                        disabled={isResendLoading || !pendingAdminId}
                        className="flex-1 h-12 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white font-medium bg-transparent cursor-pointer"
                      >
                        {isResendLoading ? 'Resending...' : !pendingAdminId ? 'Send First' : 'Resend Token'}
                      </Button>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Verification Token
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={8}
                        value={verificationToken || ''}
                        onChange={(val) => setVerificationToken(val)}
                        containerClassName="gap-2"
                      >
                        <InputOTPGroup>
                          {[0,1,2,3,4,5,6,7].map((i) => (
                            <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={onVerifyToken}
                    disabled={isVerifyLoading || !pendingAdminId}
                    className="w-full h-12 bg-[#0077B6] hover:bg-[#005a8a] text-white font-medium cursor-pointer"
                  >
                    {isVerifyLoading ? 'Verifying Token...' : !pendingAdminId ? 'Send First' : 'Verify Email Address'}
                  </Button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <ShieldCheck className={`w-6 h-6 ${emailVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <div>
                    <span className={`text-sm font-semibold ${emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {emailVerified ? 'Email Verified Successfully' : 'Email Verification Required'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {emailVerified
                        ? 'You can now proceed with account creation'
                        : 'Please verify your email to continue'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Section for new admins */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <KeyRound className="w-6 h-6 text-[#0077B6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                    <p className="text-sm text-gray-600 mt-1">Set a secure password for the admin account</p>
                  </div>
                </div>

                <div className="p-6 border border-gray-200 rounded-2xl bg-gray-50/30">
                  <FloatingLabelInput
                    id="password"
                    label="Password"
                    type="password"
                    value={formData?.password || ''}
                    onChange={onFormChange}
                    icon={<KeyRound className="w-4 h-4" />}
                    isFocused={focusStates?.password}
                    setIsFocused={(f) => setFocusState('password', f)}
                    isValid={isFieldValid?.('password')}
                    errors={errors?.password}
                    showToggle
                    toggleState={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-xl">
                <User2 className="w-6 h-6 text-[#0077B6]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600 mt-1">Basic details and identification</p>
              </div>
            </div>

            <div className="p-8 border border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white space-y-6">
              <FloatingLabelInput
                id="fullName"
                label="Full Name"
                value={formData?.fullName || ''}
                onChange={onFormChange}
                icon={<User2 className="w-4 h-4" />}
                isFocused={focusStates?.fullName}
                setIsFocused={(f) => setFocusState('fullName', f)}
                isValid={isFieldValid?.('fullName')}
                errors={errors?.fullName}
                placeholder=""
              />

              {admin && (
                <FloatingLabelInput
                  id="medicalId"
                  label="Medical ID"
                  value={formData?.medicalId || ''}
                  onChange={onFormChange}
                  icon={<Hash className="w-4 h-4" />}
                  isFocused={focusStates?.medicalId}
                  setIsFocused={(f) => setFocusState('medicalId', f)}
                  isValid={isFieldValid?.('medicalId')}
                  errors={errors?.medicalId}
                  placeholder=""
                />
              )}

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Role
                </label>
                <Select value={formData?.role || ''} onValueChange={(v) => onSelectChange(v, 'role')}>
                  <SelectTrigger className="w-full h-14 rounded-xl border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6] bg-white">
                    <SelectValue placeholder="Select admin role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <User2 className="w-4 h-4" />
                        Admin
                      </div>
                    </SelectItem>
                    <SelectItem value="superadmin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        Superadmin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors?.role && <p className="text-xs text-red-600 mt-1">{errors.role.message}</p>}
              </div>

              {admin && (
                <FloatingLabelInput
                  id="password"
                  label="New Password (optional)"
                  type="password"
                  value={formData?.password || ''}
                  onChange={onFormChange}
                  icon={<KeyRound className="w-4 h-4" />}
                  isFocused={focusStates?.password}
                  setIsFocused={(f) => setFocusState('password', f)}
                  isValid={isFieldValid?.('password')}
                  errors={errors?.password}
                  showToggle
                  toggleState={showPassword}
                  onToggle={() => setShowPassword((v) => !v)}
                  placeholder=""
                />
              )}
            </div>
          </div>

          {/* Account Settings Section - Only for edit mode */}
          {admin && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Settings className="w-6 h-6 text-[#0077B6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure account status and permissions</p>
                </div>
              </div>

              <div className="p-8 border border-gray-200 rounded-2xl bg-gradient-to-br from-green-50/30 to-white">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Account Status
                    </label>
                    <Select value={String(!!formData?.isActive)} onValueChange={(v) => onSelectChange(v, 'isActive')}>
                      <SelectTrigger className="w-full h-14 rounded-xl border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium">Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="false">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <span className="font-medium">Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Status
                    </label>
                    <Select
                      value={String(!!formData?.isEmailVerified)}
                      onValueChange={(v) => onSelectChange(v, 'isEmailVerified')}
                    >
                      <SelectTrigger className="w-full h-14 rounded-xl border-gray-300 focus:border-[#0077B6] focus:ring-[#0077B6] bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600">Verified</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="false">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-amber-600">Pending Verification</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

         
          <SheetFooter className="sticky bottom-0 bg-white border-t border-gray-200 pt-8 pb-4 -mx-1 px-1 z-230">
           {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="px-8 py-3 h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-xl cursor-pointer"
              >
                Cancel Changes
              </Button>
              <Button
                type="submit"
                disabled={saveLoading || (!admin && !emailVerified)}
                className="px-8 py-3 h-12 bg-[#0077B6] hover:bg-[#005a8a] text-white disabled:bg-[#0077B6]/40 disabled:text-white  disabled:pointer-not-allowed font-medium rounded-xl shadow-lg cursor-pointer"
              >
                {saveLoading ? 'Saving Changes...' : admin ? 'Update Admin' : 'Create Admin Account'}
              </Button>
          </div>
         </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
