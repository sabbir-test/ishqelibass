"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IndianRupee,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ArrowLeft,
  Download,
  MapPin,
  CreditCard
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  shipping: number
  discount: number
  tax?: number
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  shippingAddress: {
    firstName?: string
    lastName?: string
    name?: string
    phone: string
    address: string
    city: string
    state: string
    zipCode?: string
    pincode?: string
    country?: string
  }
  paymentMethod: string
  paymentStatus?: string
  estimatedDelivery?: string
  notes?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const { state: authState } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (orderId && authState.user) {
      loadOrder()
    }
  }, [orderId, authState.user])

  const loadOrder = async () => {
    setIsLoading(true)
    try {
      if (!authState.user) {
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.order) {
          const transformedOrder: Order = {
            id: data.order.id,
            orderNumber: data.order.orderNumber,
            status: data.order.status.toLowerCase(),
            total: data.order.total,
            subtotal: data.order.subtotal,
            shipping: data.order.shipping,
            discount: data.order.discount,
            tax: data.order.tax,
            createdAt: data.order.createdAt,
            updatedAt: data.order.updatedAt,
            items: data.order.orderItems.map((item: any) => ({
              id: item.id,
              name: item.product?.name || 'Custom Product',
              price: item.price,
              quantity: item.quantity,
              image: item.product?.images?.split(',')[0] || '/api/placeholder/300/400',
              size: item.size,
              color: item.color
            })),
            shippingAddress: JSON.parse(data.order.shippingAddress || '{}'),
            paymentMethod: data.order.paymentMethod,
            paymentStatus: data.order.paymentStatus,
            estimatedDelivery: data.order.estimatedDelivery,
            notes: data.order.notes
          }
          setOrder(transformedOrder)
        } else {
          setError('Order not found')
        }
      } else if (response.status === 404) {
        setError('Order not found')
      } else if (response.status === 403) {
        setError('Unauthorized access to order')
      } else {
        setError('Failed to load order')
      }
    } catch (error) {
      console.error('Error loading order:', error)
      setError('Error loading order details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />
      case 'processing':
        return <Package className="h-5 w-5 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested order could not be found.'}</p>
            <Link href="/orders">
              <Button className="bg-pink-600 hover:bg-pink-700">
                Back to Orders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/orders">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-gray-600">Order #{order.orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-500">Estimated Delivery</p>
                      <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <p className="font-medium">{order.paymentStatus || 'Pending'}</p>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm"><span className="font-medium">Notes:</span> {order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No items found for this order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <div className="flex gap-4 text-sm text-gray-500 mt-1">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            <IndianRupee className="inline h-3 w-3" />{item.price}
                          </p>
                          <p className="text-sm text-gray-500">
                            Total: <IndianRupee className="inline h-3 w-3" />{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span><IndianRupee className="inline h-3 w-3" />{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span><IndianRupee className="inline h-3 w-3" />{order.shipping}</span>
                </div>
                {order.tax && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span><IndianRupee className="inline h-3 w-3" />{order.tax}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount</span>
                    <span className="text-green-600">-<IndianRupee className="inline h-3 w-3" />{order.discount}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span><IndianRupee className="inline h-4 w-4" />{order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">
                    {order.shippingAddress.name || 
                     `${order.shippingAddress.firstName || ''} ${order.shippingAddress.lastName || ''}`.trim() ||
                     'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress.address || 'N/A'}</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.zipCode || order.shippingAddress.pincode || ''}
                  </p>
                  {order.shippingAddress.country && (
                    <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                  )}
                  <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                {order.status === 'delivered' && (
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Reorder
                  </Button>
                )}
                {['processing', 'pending'].includes(order.status) && (
                  <Link href={`/orders/${order.id}/cancel`}>
                    <Button variant="destructive" className="w-full">
                      Cancel Order
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
