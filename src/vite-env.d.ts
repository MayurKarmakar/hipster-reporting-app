/// <reference types="vite/client" />

declare module 'storeApp/store' {
  import { create } from 'zustand'

  export interface User {
    username: string
    isAuthenticated: boolean
  }

  export interface Booking {
    id: string
    movie: string
    theaterLocation: string
    date: string
    time: string
    seats: string[]
    totalCost: number
  }

  export interface AppState {
    user: User
    login: (username: string) => void
    logout: () => void
    bookings: Booking[]
    addBooking: (booking: Omit<Booking, 'id'>) => void
    removeBooking: (id: string) => void
    clearBookings: () => void
    notifications: string[]
    addNotification: (message: string) => void
    clearNotifications: () => void
  }

  export const useAppStore: ReturnType<typeof create<AppState>>
  export default useAppStore
}