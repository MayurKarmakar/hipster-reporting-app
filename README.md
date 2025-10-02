# Reports App

Analytics and reporting micro frontend for the movie ticket booking application.

## Setup

### Installation

```bash
cd reports-app
pnpm install
```

### Development

```bash
pnpm run dev
```

Runs on `http://localhost:3003` 

### Build

```bash
pnpm run build
pnpm run preview
```

## Architecture Decisions

### Module Federation

Uses Vite Plugin Federation to expose reporting components as remote modules.

**Exposed Components:**
- `./ReportingApp` → `src/components/report-view.tsx`

**Remote Dependencies:**
- `storeApp` (http://localhost:3004) - Centralized state management

**Shared Dependencies:**
- `react`, `react-dom` - Core React libraries with singleton configuration
- `recharts` - Chart library with singleton configuration

Singleton configuration prevents multiple React instances and resolves hooks errors when using recharts (which internally uses React hooks).

### Technology Stack

- **React 19** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn UI** - Component library (Card, Table)
- **Recharts 3.2** - Data visualization library
- **Module Federation** - Micro frontend architecture

### Data Visualization

Uses Recharts library for interactive charts:
- **Bar Chart** - Bookings per movie
- **Line Chart** - Bookings over time
- **Pie Chart** - Bookings by theater
- **Area Chart** - Status distribution

All charts are responsive and use Tailwind color palette.

### Responsive Design

Mobile-first approach with adaptive layouts:
- Charts stack vertically on mobile, 2-column grid on desktop
- Tables scroll horizontally on small screens
- Responsive typography and spacing
- Flexible card layouts

## Communication Design

### State Management

Consumes data from centralized Zustand store:

```typescript
import { useAppStore } from "storeApp/store";
```

### Data Dependencies

**`bookings`**
- Array of all booking records
- Read-only access (reports don't modify bookings)
- Automatically updates when bookings change in booking-app

**Booking Interface:**
```typescript
interface Booking {
  id: string;
  userId: string;
  movie: string;
  theater: string;
  showDate: string;
  showTime: string;
  seats: number;
  status: "upcoming" | "completed" | "cancelled";
  bookedAt: string;
}
```

### Data Processing

**Analytics Calculations:**
1. **Movie Statistics:**
   - Groups bookings by movie name
   - Counts total bookings per movie
   - Displays in bar chart format

2. **Timeline Analysis:**
   - Groups bookings by date
   - Tracks booking trends over time
   - Displays in line chart format

3. **Theater Distribution:**
   - Groups bookings by theater location
   - Calculates percentage distribution
   - Displays in pie chart format

4. **Status Metrics:**
   - Categorizes by status (upcoming/completed/cancelled)
   - Shows cumulative trends
   - Displays in area chart format

5. **Table View:**
   - Shows raw booking data
   - Includes all booking details
   - Sortable and filterable

### Communication Flow

**Real-Time Updates:**
1. Booking-app creates/updates/deletes booking
2. Store updates `bookings` array
3. Reports-app automatically re-renders (Zustand subscription)
4. Charts recalculate with new data
5. UI updates without manual refresh

**Data Flow:**
```
booking-app → storeApp.bookings → reports-app
     ↓                                    ↓
  addBooking()                      useAppStore()
  updateBooking()                        ↓
  deleteBooking()                  Calculate metrics
                                         ↓
                                   Render charts
```

### Cross-App Communication

**Dependency on Booking App:**
- Reports data sourced entirely from booking-app bookings
- No bookings = empty charts with placeholder messages
- Changes in booking-app immediately reflect in reports

**No Direct Communication:**
- Reports-app only reads data, doesn't modify bookings
- Unidirectional data flow (booking-app → reports-app)
- Loose coupling via shared store interface

### Performance Considerations

**Data Aggregation:**
- Calculations performed in component (client-side)
- Memoization could be added for large datasets
- Recharts handles rendering optimization

**Singleton Dependencies:**
- Single recharts instance prevents duplicate bundle loading
- Single React instance ensures hooks work correctly
- Reduces bundle size and memory usage

### Error Handling

If bookings data is unavailable or empty:
- Charts display empty states
- Table shows "No data available" message
- App doesn't crash or show errors
