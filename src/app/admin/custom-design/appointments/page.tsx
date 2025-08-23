'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, XCircle, Clock as ClockIcon, Ruler, Save, Plus, Search } from 'lucide-react'
import { format } from 'date-fns'

interface Appointment {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  appointmentDate: string
  appointmentType?: "VIRTUAL" | "IN_PERSON"
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  customOrderId: string
  measurementDetails?: string
  detailedMeasurements?: DetailedMeasurement[]
  createdAt: string
}

interface DetailedMeasurement {
  id: string
  customOrderId?: string
  userId?: string
  user?: {
    id: string
    name: string
    email: string
    phone: string
  }
  blouseBackLength?: number
  fullShoulder?: number
  shoulderStrap?: number
  backNeckDepth?: number
  frontNeckDepth?: number
  shoulderToApex?: number
  frontLength?: number
  chest?: number
  waist?: number
  sleeveLength?: number
  armRound?: number
  sleeveRound?: number
  armHole?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  phone?: string
  isActive: boolean
  createdAt: string
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false)
  const [isAddingDetailedMeasurements, setIsAddingDetailedMeasurements] = useState(false)
  const [measurementForm, setMeasurementForm] = useState({
    bust: '',
    waist: '',
    hips: '',
    shoulder: '',
    sleeveLength: '',
    blouseLength: '',
    notes: ''
  })
  const [detailedMeasurementForm, setDetailedMeasurementForm] = useState({
    blouseBackLength: '',
    fullShoulder: '',
    shoulderStrap: '',
    backNeckDepth: '',
    frontNeckDepth: '',
    shoulderToApex: '',
    frontLength: '',
    chest: '',
    waist: '',
    sleeveLength: '',
    armRound: '',
    sleeveRound: '',
    armHole: '',
    notes: ''
  })
  const [detailedMeasurements, setDetailedMeasurements] = useState<DetailedMeasurement[]>([])
  const [editingMeasurement, setEditingMeasurement] = useState<DetailedMeasurement | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isAddingStandaloneMeasurement, setIsAddingStandaloneMeasurement] = useState(false)
  const [standaloneMeasurementForm, setStandaloneMeasurementForm] = useState({
    userId: '',
    blouseBackLength: '',
    fullShoulder: '',
    shoulderStrap: '',
    backNeckDepth: '',
    frontNeckDepth: '',
    shoulderToApex: '',
    frontLength: '',
    chest: '',
    waist: '',
    sleeveLength: '',
    armRound: '',
    sleeveRound: '',
    armHole: '',
    notes: ''
  })
  const [measurementSearchTerm, setMeasurementSearchTerm] = useState('')
  const [allMeasurements, setAllMeasurements] = useState<DetailedMeasurement[]>([])
  const [isEditingTableMeasurement, setIsEditingTableMeasurement] = useState(false)
  const [tableMeasurementForm, setTableMeasurementForm] = useState({
    userId: '',
    blouseBackLength: '',
    fullShoulder: '',
    shoulderStrap: '',
    backNeckDepth: '',
    frontNeckDepth: '',
    shoulderToApex: '',
    frontLength: '',
    chest: '',
    waist: '',
    sleeveLength: '',
    armRound: '',
    sleeveRound: '',
    armHole: '',
    notes: ''
  })
  const [editingTableMeasurement, setEditingTableMeasurement] = useState<DetailedMeasurement | null>(null)

  useEffect(() => {
    fetchAppointments()
    fetchUsers()
    fetchAllMeasurements()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, statusFilter, searchTerm])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/custom-design/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = appointments

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userPhone.includes(searchTerm) ||
        (app.appointmentDate && new Date(app.appointmentDate).toLocaleDateString().includes(searchTerm))
      )
    }

    setFilteredAppointments(filtered)
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/custom-design/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      })

      if (response.ok) {
        await fetchAppointments()
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment(null)
        }
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const startEditingMeasurements = (appointment: Appointment) => {
    if (appointment.measurementDetails) {
      try {
        const measurements = JSON.parse(appointment.measurementDetails)
        setMeasurementForm({
          bust: measurements.bust || '',
          waist: measurements.waist || '',
          hips: measurements.hips || '',
          shoulder: measurements.shoulder || '',
          sleeveLength: measurements.sleeveLength || '',
          blouseLength: measurements.blouseLength || '',
          notes: measurements.notes || ''
        })
      } catch (error) {
        console.error('Error parsing measurement details:', error)
      }
    }
    setIsEditingMeasurements(true)
  }

  const saveMeasurements = async () => {
    if (!selectedAppointment) return

    setIsUpdating(true)
    try {
      const measurementDetails = JSON.stringify(measurementForm)
      const response = await fetch(`/api/admin/custom-design/appointments/${selectedAppointment.id}/measurements`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ measurementDetails }),
      })

      if (response.ok) {
        await fetchAppointments()
        setIsEditingMeasurements(false)
        // Update the selected appointment with new measurement details
        const updatedAppointment = { ...selectedAppointment, measurementDetails }
        setSelectedAppointment(updatedAppointment)
      }
    } catch (error) {
      console.error('Error saving measurements:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMeasurementChange = (field: string, value: string) => {
    setMeasurementForm(prev => ({ ...prev, [field]: value }))
  }

  const fetchDetailedMeasurements = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/admin/custom-design/appointments/${appointmentId}/detailed-measurements`)
      if (response.ok) {
        const data = await response.json()
        setDetailedMeasurements(data)
      }
    } catch (error) {
      console.error('Error fetching detailed measurements:', error)
    }
  }

  const startAddingDetailedMeasurements = () => {
    setDetailedMeasurementForm({
      blouseBackLength: '',
      fullShoulder: '',
      shoulderStrap: '',
      backNeckDepth: '',
      frontNeckDepth: '',
      shoulderToApex: '',
      frontLength: '',
      chest: '',
      waist: '',
      sleeveLength: '',
      armRound: '',
      sleeveRound: '',
      armHole: '',
      notes: ''
    })
    setEditingMeasurement(null)
    setIsAddingDetailedMeasurements(true)
  }

  const startEditingDetailedMeasurement = (measurement: DetailedMeasurement) => {
    setDetailedMeasurementForm({
      blouseBackLength: measurement.blouseBackLength?.toString() || '',
      fullShoulder: measurement.fullShoulder?.toString() || '',
      shoulderStrap: measurement.shoulderStrap?.toString() || '',
      backNeckDepth: measurement.backNeckDepth?.toString() || '',
      frontNeckDepth: measurement.frontNeckDepth?.toString() || '',
      shoulderToApex: measurement.shoulderToApex?.toString() || '',
      frontLength: measurement.frontLength?.toString() || '',
      chest: measurement.chest?.toString() || '',
      waist: measurement.waist?.toString() || '',
      sleeveLength: measurement.sleeveLength?.toString() || '',
      armRound: measurement.armRound?.toString() || '',
      sleeveRound: measurement.sleeveRound?.toString() || '',
      armHole: measurement.armHole?.toString() || '',
      notes: measurement.notes || ''
    })
    setEditingMeasurement(measurement)
    setIsAddingDetailedMeasurements(true)
  }

  const handleDetailedMeasurementChange = (field: string, value: string) => {
    setDetailedMeasurementForm(prev => ({ ...prev, [field]: value }))
  }

  const saveDetailedMeasurement = async () => {
    if (!selectedAppointment) return

    setIsUpdating(true)
    try {
      const url = editingMeasurement
        ? `/api/admin/custom-design/appointments/${selectedAppointment.id}/detailed-measurements/${editingMeasurement.id}`
        : `/api/admin/custom-design/appointments/${selectedAppointment.id}/detailed-measurements`

      const method = editingMeasurement ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(detailedMeasurementForm),
      })

      if (response.ok) {
        await fetchDetailedMeasurements(selectedAppointment.id)
        setIsAddingDetailedMeasurements(false)
        setEditingMeasurement(null)
      }
    } catch (error) {
      console.error('Error saving detailed measurement:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteDetailedMeasurement = async (measurementId: string) => {
    if (!selectedAppointment) return

    if (!confirm('Are you sure you want to delete this measurement?')) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/custom-design/appointments/${selectedAppointment.id}/detailed-measurements/${measurementId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchDetailedMeasurements(selectedAppointment.id)
        await fetchAllMeasurements()
      }
    } catch (error) {
      console.error('Error deleting detailed measurement:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAllMeasurements = async () => {
    try {
      const response = await fetch('/api/admin/measurements')
      if (response.ok) {
        const data = await response.json()
        setAllMeasurements(data)
      }
    } catch (error) {
      console.error('Error fetching all measurements:', error)
    }
  }

  const startAddingStandaloneMeasurement = () => {
    setStandaloneMeasurementForm({
      userId: '',
      blouseBackLength: '',
      fullShoulder: '',
      shoulderStrap: '',
      backNeckDepth: '',
      frontNeckDepth: '',
      shoulderToApex: '',
      frontLength: '',
      chest: '',
      waist: '',
      sleeveLength: '',
      armRound: '',
      sleeveRound: '',
      armHole: '',
      notes: ''
    })
    setIsAddingStandaloneMeasurement(true)
  }

  const handleStandaloneMeasurementChange = (field: string, value: string) => {
    setStandaloneMeasurementForm(prev => ({ ...prev, [field]: value }))
  }

  const saveStandaloneMeasurement = async (addAnother = false) => {
    if (!standaloneMeasurementForm.userId) {
      alert('Please select a user')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch('/api/admin/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(standaloneMeasurementForm),
      })

      if (response.ok) {
        await fetchAllMeasurements()
        
        if (addAnother) {
          // Reset form but keep the user selected
          setStandaloneMeasurementForm(prev => ({
            ...prev,
            blouseBackLength: '',
            fullShoulder: '',
            shoulderStrap: '',
            backNeckDepth: '',
            frontNeckDepth: '',
            shoulderToApex: '',
            frontLength: '',
            chest: '',
            waist: '',
            sleeveLength: '',
            armRound: '',
            sleeveRound: '',
            armHole: '',
            notes: ''
          }))
        } else {
          setIsAddingStandaloneMeasurement(false)
        }
      }
    } catch (error) {
      console.error('Error saving standalone measurement:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteStandaloneMeasurement = async (measurementId: string) => {
    if (!confirm('Are you sure you want to delete this measurement?')) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/measurements/${measurementId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchAllMeasurements()
      }
    } catch (error) {
      console.error('Error deleting standalone measurement:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const startEditingTableMeasurement = (measurement: DetailedMeasurement) => {
    setTableMeasurementForm({
      userId: measurement.userId || '',
      blouseBackLength: measurement.blouseBackLength?.toString() || '',
      fullShoulder: measurement.fullShoulder?.toString() || '',
      shoulderStrap: measurement.shoulderStrap?.toString() || '',
      backNeckDepth: measurement.backNeckDepth?.toString() || '',
      frontNeckDepth: measurement.frontNeckDepth?.toString() || '',
      shoulderToApex: measurement.shoulderToApex?.toString() || '',
      frontLength: measurement.frontLength?.toString() || '',
      chest: measurement.chest?.toString() || '',
      waist: measurement.waist?.toString() || '',
      sleeveLength: measurement.sleeveLength?.toString() || '',
      armRound: measurement.armRound?.toString() || '',
      sleeveRound: measurement.sleeveRound?.toString() || '',
      armHole: measurement.armHole?.toString() || '',
      notes: measurement.notes || ''
    })
    setEditingTableMeasurement(measurement)
    setIsEditingTableMeasurement(true)
  }

  const handleTableMeasurementChange = (field: string, value: string) => {
    setTableMeasurementForm(prev => ({ ...prev, [field]: value }))
  }

  const saveTableMeasurement = async () => {
    if (!editingTableMeasurement) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/measurements/${editingTableMeasurement.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableMeasurementForm),
      })

      if (response.ok) {
        await fetchAllMeasurements()
        setIsEditingTableMeasurement(false)
        setEditingTableMeasurement(null)
      }
    } catch (error) {
      console.error('Error saving table measurement:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredMeasurements = allMeasurements.filter(measurement => {
    if (!measurementSearchTerm) return true
    
    const searchLower = measurementSearchTerm.toLowerCase()
    return (
      measurement.user?.name?.toLowerCase().includes(searchLower) ||
      measurement.user?.email?.toLowerCase().includes(searchLower)
    )
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-4 w-4" />
      case 'CONFIRMED': return <Clock className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Measurement Appointments</h1>
          <p className="text-gray-600 mt-2">Manage customer measurement appointments</p>
        </div>
        <Button onClick={fetchAppointments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ClockIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'CONFIRMED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Measurement Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Measurement
              </CardTitle>
              <CardDescription>
                Create new measurement records for any user
              </CardDescription>
            </div>
            <Button
              onClick={startAddingStandaloneMeasurement}
              disabled={isAddingStandaloneMeasurement}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Add New Measurement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingStandaloneMeasurement && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="h-4 w-4" />
                <span className="font-medium">Add New Measurement</span>
              </div>
              
              {/* User Selection */}
              <div className="mb-4">
                <Label htmlFor="userSelect" className="text-sm font-medium">Select User *</Label>
                <Select
                  value={standaloneMeasurementForm.userId}
                  onValueChange={(value) => handleStandaloneMeasurementChange('userId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="standaloneBlouseBackLength" className="text-xs">Blouse Back Length (inches)</Label>
                  <Input
                    id="standaloneBlouseBackLength"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={standaloneMeasurementForm.blouseBackLength}
                    onChange={(e) => handleStandaloneMeasurementChange('blouseBackLength', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneFullShoulder" className="text-xs">Full Shoulder (inches)</Label>
                  <Input
                    id="standaloneFullShoulder"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={standaloneMeasurementForm.fullShoulder}
                    onChange={(e) => handleStandaloneMeasurementChange('fullShoulder', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneShoulderStrap" className="text-xs">Shoulder Strap (inches)</Label>
                  <Input
                    id="standaloneShoulderStrap"
                    type="number"
                    step="0.1"
                    placeholder="5"
                    value={standaloneMeasurementForm.shoulderStrap}
                    onChange={(e) => handleStandaloneMeasurementChange('shoulderStrap', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneBackNeckDepth" className="text-xs">Back Neck Depth (inches)</Label>
                  <Input
                    id="standaloneBackNeckDepth"
                    type="number"
                    step="0.1"
                    placeholder="6"
                    value={standaloneMeasurementForm.backNeckDepth}
                    onChange={(e) => handleStandaloneMeasurementChange('backNeckDepth', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneFrontNeckDepth" className="text-xs">Front Neck Depth (inches)</Label>
                  <Input
                    id="standaloneFrontNeckDepth"
                    type="number"
                    step="0.1"
                    placeholder="7"
                    value={standaloneMeasurementForm.frontNeckDepth}
                    onChange={(e) => handleStandaloneMeasurementChange('frontNeckDepth', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneShoulderToApex" className="text-xs">Shoulder to Apex (inches)</Label>
                  <Input
                    id="standaloneShoulderToApex"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={standaloneMeasurementForm.shoulderToApex}
                    onChange={(e) => handleStandaloneMeasurementChange('shoulderToApex', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneFrontLength" className="text-xs">Front Length (inches)</Label>
                  <Input
                    id="standaloneFrontLength"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={standaloneMeasurementForm.frontLength}
                    onChange={(e) => handleStandaloneMeasurementChange('frontLength', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneChest" className="text-xs">Chest (around) (inches)</Label>
                  <Input
                    id="standaloneChest"
                    type="number"
                    step="0.1"
                    placeholder="36"
                    value={standaloneMeasurementForm.chest}
                    onChange={(e) => handleStandaloneMeasurementChange('chest', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneWaist" className="text-xs">Waist (around) (inches)</Label>
                  <Input
                    id="standaloneWaist"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={standaloneMeasurementForm.waist}
                    onChange={(e) => handleStandaloneMeasurementChange('waist', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneSleeveLength" className="text-xs">Sleeve Length (inches)</Label>
                  <Input
                    id="standaloneSleeveLength"
                    type="number"
                    step="0.1"
                    placeholder="18"
                    value={standaloneMeasurementForm.sleeveLength}
                    onChange={(e) => handleStandaloneMeasurementChange('sleeveLength', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneArmRound" className="text-xs">Arm Round (inches)</Label>
                  <Input
                    id="standaloneArmRound"
                    type="number"
                    step="0.1"
                    placeholder="12"
                    value={standaloneMeasurementForm.armRound}
                    onChange={(e) => handleStandaloneMeasurementChange('armRound', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneSleeveRound" className="text-xs">Sleeve Round (inches)</Label>
                  <Input
                    id="standaloneSleeveRound"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={standaloneMeasurementForm.sleeveRound}
                    onChange={(e) => handleStandaloneMeasurementChange('sleeveRound', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="standaloneArmHole" className="text-xs">Arm Hole (inches)</Label>
                  <Input
                    id="standaloneArmHole"
                    type="number"
                    step="0.1"
                    placeholder="16"
                    value={standaloneMeasurementForm.armHole}
                    onChange={(e) => handleStandaloneMeasurementChange('armHole', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div className="mt-3">
                <Label htmlFor="standaloneMeasurementNotes" className="text-xs">Additional Notes</Label>
                <Textarea
                  id="standaloneMeasurementNotes"
                  placeholder="Any specific requirements or preferences..."
                  value={standaloneMeasurementForm.notes}
                  onChange={(e) => handleStandaloneMeasurementChange('notes', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => saveStandaloneMeasurement(false)}
                  disabled={isUpdating || !standaloneMeasurementForm.userId}
                  size="sm"
                  className="flex-1"
                >
                  <Save className="h-3 w-3 mr-1" />
                  {isUpdating ? 'Saving...' : 'Save Measurement'}
                </Button>
                <Button
                  onClick={() => saveStandaloneMeasurement(true)}
                  disabled={isUpdating || !standaloneMeasurementForm.userId}
                  variant="outline"
                  size="sm"
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save & Add Another
                </Button>
                <Button
                  onClick={() => setIsAddingStandaloneMeasurement(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Measurement Modal */}
      {isEditingTableMeasurement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Edit Measurement</h3>
                  <span className="text-sm text-gray-500">
                    for {editingTableMeasurement?.user?.name || 'Unknown User'}
                  </span>
                </div>
                <Button
                  onClick={() => {
                    setIsEditingTableMeasurement(false)
                    setEditingTableMeasurement(null)
                  }}
                  variant="outline"
                  size="sm"
                >
                  ×
                </Button>
              </div>

              {/* User Selection */}
              <div className="mb-6">
                <Label htmlFor="editUserSelect" className="text-sm font-medium">User *</Label>
                <Select
                  value={tableMeasurementForm.userId}
                  onValueChange={(value) => handleTableMeasurementChange('userId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Measurement Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="editBlouseBackLength" className="text-xs">Blouse Back Length (inches)</Label>
                  <Input
                    id="editBlouseBackLength"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={tableMeasurementForm.blouseBackLength}
                    onChange={(e) => handleTableMeasurementChange('blouseBackLength', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editFullShoulder" className="text-xs">Full Shoulder (inches)</Label>
                  <Input
                    id="editFullShoulder"
                    type="number"
                    step="0.1"
                    placeholder="15"
                    value={tableMeasurementForm.fullShoulder}
                    onChange={(e) => handleTableMeasurementChange('fullShoulder', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editShoulderStrap" className="text-xs">Shoulder Strap (inches)</Label>
                  <Input
                    id="editShoulderStrap"
                    type="number"
                    step="0.1"
                    placeholder="12"
                    value={tableMeasurementForm.shoulderStrap}
                    onChange={(e) => handleTableMeasurementChange('shoulderStrap', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editBackNeckDepth" className="text-xs">Back Neck Depth (inches)</Label>
                  <Input
                    id="editBackNeckDepth"
                    type="number"
                    step="0.1"
                    placeholder="6"
                    value={tableMeasurementForm.backNeckDepth}
                    onChange={(e) => handleTableMeasurementChange('backNeckDepth', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editFrontNeckDepth" className="text-xs">Front Neck Depth (inches)</Label>
                  <Input
                    id="editFrontNeckDepth"
                    type="number"
                    step="0.1"
                    placeholder="7"
                    value={tableMeasurementForm.frontNeckDepth}
                    onChange={(e) => handleTableMeasurementChange('frontNeckDepth', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editShoulderToApex" className="text-xs">Shoulder to Apex (inches)</Label>
                  <Input
                    id="editShoulderToApex"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={tableMeasurementForm.shoulderToApex}
                    onChange={(e) => handleTableMeasurementChange('shoulderToApex', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editFrontLength" className="text-xs">Front Length (inches)</Label>
                  <Input
                    id="editFrontLength"
                    type="number"
                    step="0.1"
                    placeholder="26"
                    value={tableMeasurementForm.frontLength}
                    onChange={(e) => handleTableMeasurementChange('frontLength', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editChest" className="text-xs">Chest (inches)</Label>
                  <Input
                    id="editChest"
                    type="number"
                    step="0.1"
                    placeholder="36"
                    value={tableMeasurementForm.chest}
                    onChange={(e) => handleTableMeasurementChange('chest', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editWaist" className="text-xs">Waist (inches)</Label>
                  <Input
                    id="editWaist"
                    type="number"
                    step="0.1"
                    placeholder="30"
                    value={tableMeasurementForm.waist}
                    onChange={(e) => handleTableMeasurementChange('waist', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editSleeveLength" className="text-xs">Sleeve Length (inches)</Label>
                  <Input
                    id="editSleeveLength"
                    type="number"
                    step="0.1"
                    placeholder="22"
                    value={tableMeasurementForm.sleeveLength}
                    onChange={(e) => handleTableMeasurementChange('sleeveLength', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editArmRound" className="text-xs">Arm Round (inches)</Label>
                  <Input
                    id="editArmRound"
                    type="number"
                    step="0.1"
                    placeholder="10"
                    value={tableMeasurementForm.armRound}
                    onChange={(e) => handleTableMeasurementChange('armRound', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editSleeveRound" className="text-xs">Sleeve Round (inches)</Label>
                  <Input
                    id="editSleeveRound"
                    type="number"
                    step="0.1"
                    placeholder="12"
                    value={tableMeasurementForm.sleeveRound}
                    onChange={(e) => handleTableMeasurementChange('sleeveRound', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div>
                  <Label htmlFor="editArmHole" className="text-xs">Arm Hole (inches)</Label>
                  <Input
                    id="editArmHole"
                    type="number"
                    step="0.1"
                    placeholder="16"
                    value={tableMeasurementForm.armHole}
                    onChange={(e) => handleTableMeasurementChange('armHole', e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <Label htmlFor="editNotes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="editNotes"
                  placeholder="Additional notes about this measurement..."
                  value={tableMeasurementForm.notes}
                  onChange={(e) => handleTableMeasurementChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={saveTableMeasurement}
                  disabled={isUpdating || !tableMeasurementForm.userId}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditingTableMeasurement(false)
                    setEditingTableMeasurement(null)
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by name, email, phone, or date</Label>
              <Input
                id="search"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAppointments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No appointments found</p>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAppointment?.id === appointment.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        fetchDetailedMeasurements(appointment.id)
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{appointment.userName}</span>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </Badge>
                            {appointment.appointmentType && (
                              <Badge variant="outline" className="text-xs">
                                {appointment.appointmentType === 'VIRTUAL' ? '📹 Virtual' : '🏪 In-Person'}
                              </Badge>
                            )}
                            {appointment.status === 'COMPLETED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditingMeasurements(appointment)
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                <Ruler className="h-3 w-3 mr-1" />
                                Edit Measurements
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{appointment.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{appointment.userPhone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(appointment.appointmentDate), 'PPP')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="h-3 w-3" />
                              <span>{format(new Date(appointment.appointmentDate), 'p')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAppointment ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{selectedAppointment.userName}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 ml-6">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{selectedAppointment.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{selectedAppointment.userPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Appointment Date</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      <div>{format(new Date(selectedAppointment.appointmentDate), 'PPP')}</div>
                      <div>{format(new Date(selectedAppointment.appointmentDate), 'p')}</div>
                    </div>
                  </div>

                  {selectedAppointment.appointmentType && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Appointment Type</span>
                      </div>
                      <div className="ml-6">
                        <Badge variant="outline">
                          {selectedAppointment.appointmentType === 'VIRTUAL' ? '📹 Virtual Call' : '🏪 In-Person'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Status</span>
                    </div>
                    <div className="ml-6">
                      <Badge className={getStatusColor(selectedAppointment.status)}>
                        {getStatusIcon(selectedAppointment.status)}
                        <span className="ml-1">{selectedAppointment.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <Select
                      value={selectedAppointment.status}
                      onValueChange={(value) => 
                        updateAppointmentStatus(selectedAppointment.id, value, selectedAppointment.notes)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Add Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add notes about this appointment..."
                      value={selectedAppointment.notes || ''}
                      onChange={(e) => setSelectedAppointment({
                        ...selectedAppointment,
                        notes: e.target.value
                      })}
                    />
                    <Button
                      onClick={() => updateAppointmentStatus(
                        selectedAppointment.status,
                        selectedAppointment.notes
                      )}
                      disabled={isUpdating}
                      className="w-full"
                    >
                      {isUpdating ? 'Updating...' : 'Update Notes'}
                    </Button>
                  </div>

                  {selectedAppointment.status === 'COMPLETED' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Measurements</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingMeasurements(selectedAppointment)}
                          disabled={isEditingMeasurements}
                        >
                          <Ruler className="h-3 w-3 mr-1" />
                          {selectedAppointment.measurementDetails ? 'Edit' : 'Add'} Measurements
                        </Button>
                      </div>
                      
                      {selectedAppointment.measurementDetails && !isEditingMeasurements && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {(() => {
                            try {
                              const measurements = JSON.parse(selectedAppointment.measurementDetails)
                              return (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Bust: <span className="font-medium">{measurements.bust}"</span></div>
                                  <div>Waist: <span className="font-medium">{measurements.waist}"</span></div>
                                  <div>Hips: <span className="font-medium">{measurements.hips}"</span></div>
                                  <div>Shoulder: <span className="font-medium">{measurements.shoulder}"</span></div>
                                  <div>Sleeve: <span className="font-medium">{measurements.sleeveLength}"</span></div>
                                  <div>Length: <span className="font-medium">{measurements.blouseLength}"</span></div>
                                  {measurements.notes && (
                                    <div className="col-span-2 mt-2">
                                      Notes: <span className="font-medium">{measurements.notes}</span>
                                    </div>
                                  )}
                                </div>
                              )
                            } catch (error) {
                              return <span className="text-red-500">Invalid measurement data</span>
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {isEditingMeasurements && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        <span className="font-medium">Edit Measurements</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="bust" className="text-xs">Bust (inches)</Label>
                          <Input
                            id="bust"
                            type="number"
                            placeholder="36"
                            value={measurementForm.bust}
                            onChange={(e) => handleMeasurementChange('bust', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="waist" className="text-xs">Waist (inches)</Label>
                          <Input
                            id="waist"
                            type="number"
                            placeholder="30"
                            value={measurementForm.waist}
                            onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="hips" className="text-xs">Hips (inches)</Label>
                          <Input
                            id="hips"
                            type="number"
                            placeholder="38"
                            value={measurementForm.hips}
                            onChange={(e) => handleMeasurementChange('hips', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="shoulder" className="text-xs">Shoulder (inches)</Label>
                          <Input
                            id="shoulder"
                            type="number"
                            placeholder="15"
                            value={measurementForm.shoulder}
                            onChange={(e) => handleMeasurementChange('shoulder', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sleeveLength" className="text-xs">Sleeve Length (inches)</Label>
                          <Input
                            id="sleeveLength"
                            type="number"
                            placeholder="18"
                            value={measurementForm.sleeveLength}
                            onChange={(e) => handleMeasurementChange('sleeveLength', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="blouseLength" className="text-xs">Blouse Length (inches)</Label>
                          <Input
                            id="blouseLength"
                            type="number"
                            placeholder="15"
                            value={measurementForm.blouseLength}
                            onChange={(e) => handleMeasurementChange('blouseLength', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="measurementNotes" className="text-xs">Additional Notes</Label>
                        <Textarea
                          id="measurementNotes"
                          placeholder="Any specific requirements or preferences..."
                          value={measurementForm.notes}
                          onChange={(e) => handleMeasurementChange('notes', e.target.value)}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={saveMeasurements}
                          disabled={isUpdating}
                          size="sm"
                          className="flex-1"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {isUpdating ? 'Saving...' : 'Save Measurements'}
                        </Button>
                        <Button
                          onClick={() => setIsEditingMeasurements(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Select an appointment to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Measurement Table Section */}
        <div className="lg:col-span-3 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Measurement Table</CardTitle>
                  <CardDescription>
                    Manage detailed customer measurements for appointments and standalone records
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search measurements..."
                      value={measurementSearchTerm}
                      onChange={(e) => setMeasurementSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  {selectedAppointment && (
                    <Button
                      onClick={startAddingDetailedMeasurements}
                      disabled={isAddingDetailedMeasurements}
                      size="sm"
                    >
                      <Ruler className="h-4 w-4 mr-2" />
                      Add Appointment Measurement
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add/Edit Measurement Form for Appointments */}
                {selectedAppointment && isAddingDetailedMeasurements && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                      <Ruler className="h-4 w-4" />
                      <span className="font-medium">
                        {editingMeasurement ? 'Edit Appointment Measurement' : 'Add New Appointment Measurement'}
                      </span>
                      <span className="text-sm text-gray-500">for {selectedAppointment.userName}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="blouseBackLength" className="text-xs">Blouse Back Length (inches)</Label>
                        <Input
                          id="blouseBackLength"
                          type="number"
                          step="0.1"
                          placeholder="15"
                          value={detailedMeasurementForm.blouseBackLength}
                          onChange={(e) => handleDetailedMeasurementChange('blouseBackLength', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullShoulder" className="text-xs">Full Shoulder (inches)</Label>
                        <Input
                          id="fullShoulder"
                          type="number"
                          step="0.1"
                          placeholder="15"
                          value={detailedMeasurementForm.fullShoulder}
                          onChange={(e) => handleDetailedMeasurementChange('fullShoulder', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulderStrap" className="text-xs">Shoulder Strap (inches)</Label>
                        <Input
                          id="shoulderStrap"
                          type="number"
                          step="0.1"
                          placeholder="5"
                          value={detailedMeasurementForm.shoulderStrap}
                          onChange={(e) => handleDetailedMeasurementChange('shoulderStrap', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="backNeckDepth" className="text-xs">Back Neck Depth (inches)</Label>
                        <Input
                          id="backNeckDepth"
                          type="number"
                          step="0.1"
                          placeholder="6"
                          value={detailedMeasurementForm.backNeckDepth}
                          onChange={(e) => handleDetailedMeasurementChange('backNeckDepth', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="frontNeckDepth" className="text-xs">Front Neck Depth (inches)</Label>
                        <Input
                          id="frontNeckDepth"
                          type="number"
                          step="0.1"
                          placeholder="7"
                          value={detailedMeasurementForm.frontNeckDepth}
                          onChange={(e) => handleDetailedMeasurementChange('frontNeckDepth', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shoulderToApex" className="text-xs">Shoulder to Apex (inches)</Label>
                        <Input
                          id="shoulderToApex"
                          type="number"
                          step="0.1"
                          placeholder="10"
                          value={detailedMeasurementForm.shoulderToApex}
                          onChange={(e) => handleDetailedMeasurementChange('shoulderToApex', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="frontLength" className="text-xs">Front Length (inches)</Label>
                        <Input
                          id="frontLength"
                          type="number"
                          step="0.1"
                          placeholder="15"
                          value={detailedMeasurementForm.frontLength}
                          onChange={(e) => handleDetailedMeasurementChange('frontLength', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="chest" className="text-xs">Chest (inches)</Label>
                        <Input
                          id="chest"
                          type="number"
                          step="0.1"
                          placeholder="36"
                          value={detailedMeasurementForm.chest}
                          onChange={(e) => handleDetailedMeasurementChange('chest', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="waist" className="text-xs">Waist (inches)</Label>
                        <Input
                          id="waist"
                          type="number"
                          step="0.1"
                          placeholder="30"
                          value={detailedMeasurementForm.waist}
                          onChange={(e) => handleDetailedMeasurementChange('waist', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sleeveLength" className="text-xs">Sleeve Length (inches)</Label>
                        <Input
                          id="sleeveLength"
                          type="number"
                          step="0.1"
                          placeholder="18"
                          value={detailedMeasurementForm.sleeveLength}
                          onChange={(e) => handleDetailedMeasurementChange('sleeveLength', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="armRound" className="text-xs">Arm Round (inches)</Label>
                        <Input
                          id="armRound"
                          type="number"
                          step="0.1"
                          placeholder="12"
                          value={detailedMeasurementForm.armRound}
                          onChange={(e) => handleDetailedMeasurementChange('armRound', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sleeveRound" className="text-xs">Sleeve Round (inches)</Label>
                        <Input
                          id="sleeveRound"
                          type="number"
                          step="0.1"
                          placeholder="10"
                          value={detailedMeasurementForm.sleeveRound}
                          onChange={(e) => handleDetailedMeasurementChange('sleeveRound', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="armHole" className="text-xs">Arm Hole (inches)</Label>
                        <Input
                          id="armHole"
                          type="number"
                          step="0.1"
                          placeholder="16"
                          value={detailedMeasurementForm.armHole}
                          onChange={(e) => handleDetailedMeasurementChange('armHole', e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Label htmlFor="measurementNotes" className="text-xs">Additional Notes</Label>
                      <Textarea
                        id="measurementNotes"
                        placeholder="Any specific requirements or preferences..."
                        value={detailedMeasurementForm.notes}
                        onChange={(e) => handleDetailedMeasurementChange('notes', e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={saveDetailedMeasurement}
                        disabled={isUpdating}
                        size="sm"
                        className="flex-1"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        {isUpdating ? 'Saving...' : (editingMeasurement ? 'Update Measurement' : 'Save Measurement')}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingDetailedMeasurements(false)
                          setEditingMeasurement(null)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* All Measurements Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Back Length</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shoulder</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Chest</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waist</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sleeve</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredMeasurements.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                              {measurementSearchTerm ? 'No measurements found matching your search.' : 'No measurements found. Use the "Add Measurement" card above to create one.'}
                            </td>
                          </tr>
                        ) : (
                          filteredMeasurements.map((measurement) => (
                            <tr key={measurement.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">
                                {format(new Date(measurement.createdAt), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div>
                                  <div className="font-medium">{measurement.user?.name || 'Unknown'}</div>
                                  <div className="text-xs text-gray-500">{measurement.user?.email}</div>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <Badge variant={measurement.customOrderId ? "default" : "secondary"}>
                                  {measurement.customOrderId ? 'Appointment' : 'Standalone'}
                                </Badge>
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {measurement.blouseBackLength ? `${measurement.blouseBackLength}"` : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {measurement.fullShoulder ? `${measurement.fullShoulder}"` : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {measurement.chest ? `${measurement.chest}"` : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {measurement.waist ? `${measurement.waist}"` : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {measurement.sleeveLength ? `${measurement.sleeveLength}"` : '-'}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => startEditingTableMeasurement(measurement)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => measurement.customOrderId 
                                      ? deleteDetailedMeasurement(measurement.id)
                                      : deleteStandaloneMeasurement(measurement.id)
                                    }
                                    className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Measurement Details Summary */}
                {filteredMeasurements.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <p>Showing {filteredMeasurements.length} of {allMeasurements.length} total measurement records</p>
                    <p className="text-xs mt-1">
                      {filteredMeasurements.filter(m => m.customOrderId).length} appointment-linked, 
                      {filteredMeasurements.filter(m => !m.customOrderId).length} standalone
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}