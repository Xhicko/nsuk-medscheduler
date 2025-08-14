'use client'

import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { ADMIN_ENDPOINTS } from '@/config/adminConfig'
import { toast } from 'react-hot-toast'
import { Pencil, Trash2 } from 'lucide-react'
import { useAdminStore } from '@/store/admin/adminStore'
import { getApiErrorMessage } from '@/lib/api/client'

export default function AdminManagementLogic(initialData){
  // Persisted pending admin (id/email) for verification flows
  const pendingAdminId = useAdminStore(s => s.pendingAdminId)
  const pendingAdminEmail = useAdminStore(s => s.pendingAdminEmail)
  const setPendingAdmin = useAdminStore(s => s.setPendingAdmin)
  const clearPendingAdmin = useAdminStore(s => s.clearPendingAdmin)
  const [admins, setAdmins] = useState(initialData?.admins || [])
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [totalAdminsCount, setTotalAdminsCount] = useState(initialData?.pagination?.total || 0)

  // Edit sheet states
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [editFormData, setEditFormData] = useState(null)
  const [editFocusStates, setEditFocusStates] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [saveLoading, setSaveLoading] = useState(false)

  // Email verification flow for creation
  const [emailVerified, setEmailVerified] = useState(false)
  const [verificationToken, setVerificationToken] = useState('')
  const [isSendLoading, setIsSendLoading] = useState(false)
  const [isVerifyLoading, setIsVerifyLoading] = useState(false)
  const [isResendLoading, setIsResendLoading] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Delete confirmation states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState(null)

  // Add/Edit confirmation dialogs
  const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false)
  const [isEditConfirmOpen, setIsEditConfirmOpen] = useState(false)
  const [editCandidate, setEditCandidate] = useState(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState(initialData?.filters?.searchTerm ?? "")
  const [roleFilter, setRoleFilter] = useState(initialData?.filters?.role ?? "all")
  const [statusFilter, setStatusFilter] = useState(initialData?.filters?.status ?? "all")

  // Pagination states
  const [currentPage, setCurrentPage] = useState(initialData?.pagination?.page || 1)
  const [itemsPerPage] = useState(10)

  const searchTimeoutRef = useRef(null)

  const fetchAdmins = async (page = currentPage, search = searchTerm, role = roleFilter, status = statusFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', itemsPerPage.toString())
      if (search && search.trim()) params.append('search', search.trim())
      if (role && role !== 'all') params.append('role', role)
      if (status && status !== 'all') params.append('status', status)

      const response = await axios.get(`${ADMIN_ENDPOINTS.ADMIN_MANAGEMENT}?${params.toString()}`)
      if (response.status === 200){
        setAdmins(response.data.admins || [])
        setTotalAdminsCount(response.data.pagination?.total || 0)
        if (response.data.pagination){
          const serverPage = response.data.pagination.page
          if (serverPage !== currentPage) setCurrentPage(serverPage)
        }
      } else {
        setAdmins([])
        setTotalAdminsCount(0)
      }
    } catch (error){
      console.error('Error fetching admins:', error)
      setAdmins([])
      setTotalAdminsCount(0)
  toast.error(getApiErrorMessage(error, 'Failed to fetch admins data'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    setDeleteLoading(true)
    let deletionSucceeded = false
    try{
      const response = await axios.delete(`${ADMIN_ENDPOINTS.ADMIN_MANAGEMENT}?id=${adminId}`)
      if (response.status === 200){
        toast.success('Admin deleted successfully')
        fetchAdmins(currentPage, searchTerm, roleFilter, statusFilter)
        deletionSucceeded = true
      }
    } catch (error){
      console.error('Error deleting admin:', error)
      toast.error(getApiErrorMessage(error, 'Failed to delete admin'))
    } finally {
      setDeleteLoading(false)
      if (deletionSucceeded) {
        closeDeleteModal()
      }
    }
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      fetchAdmins(1, value, roleFilter, statusFilter)
    }, 500)
  }

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value)
    setCurrentPage(1)
    fetchAdmins(1, searchTerm, value, statusFilter)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
    fetchAdmins(1, searchTerm, roleFilter, value)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    fetchAdmins(page, searchTerm, roleFilter, statusFilter)
  }

  const openDeleteModal = (admin) => {
    setAdminToDelete(admin)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    if (!deleteLoading){
      setIsDeleteModalOpen(false)
      setAdminToDelete(null)
    }
  }

  const handleConfirmDelete = () => {
    if (adminToDelete){
      handleDeleteAdmin(adminToDelete.id)
    }
  }

  const openEditSheet = (admin) => {
    setEditingAdmin(admin)
    setEditFormData({
      ...admin,
      fullName: admin.full_name,
      role: admin.role,
      isActive: !!admin.is_active,
      isEmailVerified: !!admin.is_email_verified,
      medicalId: admin.medical_id || '',
    })
    setEditFocusStates({})
    setEditErrors({})
    setIsEditSheetOpen(true)
  }

  const openAddSheet = () => {
    setEditingAdmin(null)
    setEditFormData({
      fullName: '',
      role: 'admin',
      isActive: true,
      isEmailVerified: false,
      medicalId: '',
  email: '',
  password: '',
    })
  setEmailVerified(false)
  setVerificationToken('')
  setIsSendLoading(false)
  setIsVerifyLoading(false)
  setIsResendLoading(false)
  setResendCountdown(0)
    setEditFocusStates({})
    setEditErrors({})
    setIsEditSheetOpen(true)
  // Keep any previously pending state if reopening; if different email, reset token state
  }

  // Confirmation flows
  const openAddConfirm = () => setIsAddConfirmOpen(true)
  const closeAddConfirm = () => setIsAddConfirmOpen(false)
  const handleConfirmAdd = () => {
    openAddSheet()
    closeAddConfirm()
  }

  const openEditConfirm = (admin) => {
    setEditCandidate(admin)
    setIsEditConfirmOpen(true)
  }
  const closeEditConfirm = () => {
    setIsEditConfirmOpen(false)
    setEditCandidate(null)
  }
  const handleConfirmEdit = () => {
    if (editCandidate) {
      openEditSheet(editCandidate)
    }
    closeEditConfirm()
  }

  const closeEditSheet = () => {
    setIsEditSheetOpen(false)
    setEditingAdmin(null)
    setEditFormData(null)
    setEditFocusStates({})
    setEditErrors({})
  }

  const handleEditFormChange = (e) => {
    const { id, value } = e.target
    setEditFormData(prev => prev ? { ...prev, [id]: value } : null)
    setEditErrors(prev => ({ ...prev, [id]: null }))
  }

  const handleEditSelectChange = (value, field) => {
    if (field === 'isActive' || field === 'isEmailVerified'){
      setEditFormData(prev => prev ? { ...prev, [field]: value === 'true' } : null)
    } else {
      setEditFormData(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  const setEditFocusState = (field, focused) => {
    setEditFocusStates(prev => ({ ...prev, [field]: focused }))
  }

  const validateEditForm = () => {
    const newErrors = {}
    let isValid = true

  if (!editFormData?.fullName?.trim()){
      newErrors.fullName = { message: 'Full Name is required' }
      isValid = false
    }

    if (!editFormData?.role || !['admin','superadmin'].includes(editFormData.role)){
      newErrors.role = { message: 'Role must be admin or superadmin' }
      isValid = false
    }

    // When creating, require email verification + password
    if (!editingAdmin){
      const email = editFormData?.email?.trim() || ''
      const password = editFormData?.password || ''
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!email) {
        newErrors.email = { message: 'Email is required' }
        isValid = false
      } else if (!emailRegex.test(email)){
        newErrors.email = { message: 'Invalid email format' }
        isValid = false
      }
      if (!password || password.length < 8){
        newErrors.password = { message: 'Password must be at least 8 characters' }
        isValid = false
      }
      if (!emailVerified){
        newErrors.email = { message: 'Verify this email before creating admin' }
        isValid = false
      }
    } else {
      // Editing: password is optional, but if provided, enforce policy
      const provided = (editFormData?.password || '').trim()
      if (provided && provided.length < 8){
        newErrors.password = { message: 'Password must be at least 8 characters' }
        isValid = false
      }
    }

    setEditErrors(newErrors)
    return isValid
  }

  const isEditFieldValid = (field) => {
    return !editErrors[field] && editFormData?.[field]?.toString().length > 0
  }

  const handleSaveAdmin = async (formData) => {
    if (!validateEditForm()) return
    setSaveLoading(true)
    try{
      if (editingAdmin && editingAdmin.id){
        const updateData = {
          fullName: formData.fullName,
          role: formData.role,
          isActive: !!formData.isActive,
          isEmailVerified: !!formData.isEmailVerified,
          medicalId: formData.medicalId || null,
        }
        // Include password only if provided and non-empty
        const maybePassword = (formData.password || '').trim()
        if (maybePassword) {
          updateData.password = maybePassword
        }
        const response = await axios.put(`${ADMIN_ENDPOINTS.ADMIN_MANAGEMENT}?id=${editingAdmin.id}`, updateData)
        if (response.status === 200){
          toast.success(response.data?.message || 'Admin updated successfully')
          fetchAdmins(currentPage, searchTerm, roleFilter, statusFilter)
          closeEditSheet()
        }
      } else {
        const createData = {
          fullName: formData.fullName,
          role: formData.role,
          isActive: true,
          isEmailVerified: true,
          medicalId: formData.medicalId || null,
          email: formData.email,
          password: formData.password,
          adminId: pendingAdminId || null,
        }
        const response = await axios.post(ADMIN_ENDPOINTS.ADMIN_MANAGEMENT, createData)
        if (response.status === 201){
          toast.success('Admin created successfully')
          fetchAdmins(1, searchTerm, roleFilter, statusFilter)
          closeEditSheet()
          clearPendingAdmin()
        }
      }
    } catch (error){
      console.error('Error updating admin:', error)
  toast.error(getApiErrorMessage(error, 'Operation failed'))
    } finally {
      setSaveLoading(false)
    }
  }


  const handleSendToken = async () => {
    if (!editFormData?.email){
      toast.error('Enter a valid email')
      return
    }
    try {
      setIsSendLoading(true)
  const res = await axios.post(ADMIN_ENDPOINTS.VERIFY_EMAIL, { action: 'send', email: editFormData.email })
      if (res.status === 200){
        toast.success(res.data?.message || 'Token sent')
        setResendCountdown(60)
        // Persist pending id/email for later resend/verify/create
        if (res.data?.adminId) setPendingAdmin(res.data.adminId, editFormData.email)
      }
    } catch (e){
      toast.error(getApiErrorMessage(e, 'Failed to send token'))
    } finally {
      setIsSendLoading(false)
    }
  }

  const handleResendToken = async () => {
    if (resendCountdown > 0) return
    if (!editFormData?.email){
      toast.error('Enter a valid email')
      return
    }
    try {
      setIsResendLoading(true)
  const adminIdForResend = pendingAdminId
  if (!adminIdForResend){
      toast.error('No pending admin. Send a token first.')
      return
    }
  const res = await axios.post(ADMIN_ENDPOINTS.VERIFY_EMAIL, { action: 'resend', email: editFormData.email, adminId: adminIdForResend })
      if (res.status === 200){
        toast.success(res.data?.message || 'Token resent')
        setResendCountdown(60)
        // Keep/store the id to be safe
        if (res.data?.adminId) setPendingAdmin(res.data.adminId, editFormData.email)
      }
    } catch (e){
      toast.error(getApiErrorMessage(e, 'Failed to resend token'))
    } finally {
      setIsResendLoading(false)
    }
  }

  const handleVerifyToken = async () => {
    if (!editFormData?.email || !verificationToken || verificationToken.length !== 8){
      toast.error('Enter the 8-digit token')
      return
    }
    try {
      setIsVerifyLoading(true)
  const adminIdForVerify = pendingAdminId
  if (!adminIdForVerify){
      toast.error('No pending admin. Send a token first.')
      return
    }
  const res = await axios.post(ADMIN_ENDPOINTS.VERIFY_EMAIL, { action: 'verify', email: editFormData.email, adminId: adminIdForVerify, token: verificationToken })
      if (res.status === 200){
        toast.success('Email verified')
        setEmailVerified(true)
      }
    } catch (e){
      setEmailVerified(false)
      toast.error(getApiErrorMessage(e, 'Invalid token'))
    } finally {
      setIsVerifyLoading(false)
    }
  }

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (editFormData && validateEditForm()){
      handleSaveAdmin(editFormData)
    }
  }

  const adminsColumns = [
    {
      key: 'full_name',
      header: 'Full Name',
      render: (item) => <span className="text-gray-900 font-medium">{item.full_name}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => <span className="text-gray-600 capitalize">{item.role}</span>,
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${item.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {item.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'is_email_verified',
      header: 'Email Verified',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${item.is_email_verified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {item.is_email_verified ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'medical_id',
      header: 'Medical ID',
      render: (item) => <span className="text-gray-600">{item.medical_id || '—'}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditConfirm(item)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded cursor-pointer"
            title="Edit Admin"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => openDeleteModal(item)}
            className="text-red-600 hover:text-red-800 p-1 cursor-pointer rounded"
            title="Delete Admin"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  return {
    // data
    admins,
    loading,

    // table
    adminsColumns,

    // search & filters
    searchTerm,
    setSearchTerm: handleSearchChange,
    roleFilter,
    setRoleFilter: handleRoleFilterChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,

    // pagination
    currentPage,
    setCurrentPage: handlePageChange,
    totalPages: Math.ceil(totalAdminsCount / itemsPerPage),
    itemsPerPage,
    totalAdmins: totalAdminsCount,
    filteredAdminsCount: admins.length,

    // delete
    isDeleteModalOpen,
    adminToDelete,
    deleteLoading,
    openDeleteModal,
    closeDeleteModal,
    handleConfirmDelete,

    // edit sheet
    isEditSheetOpen,
    editingAdmin,
    editFormData,
    editFocusStates,
    editErrors,
    saveLoading,
  // email verification
  emailVerified,
  verificationToken,
  isSendLoading,
  isVerifyLoading,
  isResendLoading,
  resendCountdown,
  openEditSheet,
  openAddSheet,
  // confirmation dialogs
  isAddConfirmOpen,
  isEditConfirmOpen,
  editCandidate,
  openAddConfirm,
  closeAddConfirm,
  handleConfirmAdd,
  openEditConfirm,
  closeEditConfirm,
  handleConfirmEdit,
    closeEditSheet,
    handleEditFormChange,
    handleEditSelectChange,
    setEditFocusState,
    validateEditForm,
    isEditFieldValid,
    handleSaveAdmin,
    handleEditSubmit,
  // token actions
  handleSendToken,
  handleResendToken,
  handleVerifyToken,
  setVerificationToken,
  // pending admin (persisted)
  pendingAdminId,
  pendingAdminEmail,

    // actions
    handleDeleteAdmin,
    fetchAdmins,
  }
}
