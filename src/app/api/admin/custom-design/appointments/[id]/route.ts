import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, notes } = body

    // Update the custom order (which represents the appointment)
    const updatedOrder = await db.customOrder.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    const appointment = {
      id: updatedOrder.id,
      userId: updatedOrder.userId,
      userName: updatedOrder.user.name || 'Unknown',
      userEmail: updatedOrder.user.email,
      userPhone: updatedOrder.user.phone || 'Not provided',
      appointmentDate: updatedOrder.appointmentDate,
      status: updatedOrder.status,
      notes: updatedOrder.notes,
      customOrderId: updatedOrder.id,
      createdAt: updatedOrder.createdAt,
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.customOrder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    )
  }
}