import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "storeApp/store";
import "../index.css";

interface MovieRevenue {
  movie: string;
  revenue: number;
  bookings: number;
}

interface DailyBookings {
  date: string;
  bookings: number;
  revenue: number;
}

interface TheaterData {
  [key: string]: string | number;
  theater: string;
  bookings: number;
  fill: string;
}

interface Booking {
    id: string
    movie: string
    theaterLocation: string
    date: string
    time: string
    seats: string[]
    totalCost: number
  }

const COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

export default function ReportView() {
  const user = useAppStore((state: any) => state.user);
  const allBookings = useAppStore((state: any) => state.allBookings) as Record<
    string,
    Booking[]
  >;

  const isAdmin = user?.role === 'admin'

  const flattenedBookings = Object.values(allBookings).flat();

  const totalRevenue = useMemo(() => {
    return flattenedBookings.reduce(
      (sum, booking) => sum + booking.totalCost,
      0
    );
  }, [flattenedBookings]);

  const avgBookingValue = useMemo(() => {
    return flattenedBookings.length > 0
      ? totalRevenue / flattenedBookings.length
      : 0;
  }, [flattenedBookings, totalRevenue]);

  const totalSeats = useMemo(() => {
    return flattenedBookings.reduce(
      (sum, booking) => sum + booking.seats.length,
      0
    );
  }, [flattenedBookings]);

  const movieRevenueData: MovieRevenue[] = useMemo(() => {
    const movieMap = new Map<string, { revenue: number; bookings: number }>();

    flattenedBookings.forEach((booking) => {
      const current = movieMap.get(booking.movie) || {
        revenue: 0,
        bookings: 0,
      };
      movieMap.set(booking.movie, {
        revenue: current.revenue + booking.totalCost,
        bookings: current.bookings + 1,
      });
    });

    return Array.from(movieMap.entries())
      .map(([movie, data]) => ({
        movie: movie.length > 20 ? movie.substring(0, 20) + "..." : movie,
        revenue: data.revenue,
        bookings: data.bookings,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [flattenedBookings]);

  const dailyBookingsData: DailyBookings[] = useMemo(() => {
    const dateMap = new Map<string, { bookings: number; revenue: number }>();

    flattenedBookings.forEach((booking) => {
      const current = dateMap.get(booking.date) || { bookings: 0, revenue: 0 };
      dateMap.set(booking.date, {
        bookings: current.bookings + 1,
        revenue: current.revenue + booking.totalCost,
      });
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        bookings: data.bookings,
        revenue: data.revenue,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [flattenedBookings]);

  const theaterData: TheaterData[] = useMemo(() => {
    const theaterMap = new Map<string, number>();

    flattenedBookings.forEach((booking) => {
      const current = theaterMap.get(booking.theaterLocation) || 0;
      theaterMap.set(booking.theaterLocation, current + 1);
    });

    return Array.from(theaterMap.entries())
      .map(([theater, count], index) => ({
        theater,
        bookings: count,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.bookings - a.bookings);
  }, [flattenedBookings]);

  if (!user) {
    return (
      <div className={cn("flex items-center justify-center p-6")}>
        <Card className={cn("w-full max-w-md")}>
          <CardHeader>
            <div className={cn("flex items-center gap-3")}>
              <ShieldAlert className={cn("h-8 w-8 text-amber-500")} />
              <CardTitle>Authentication Required</CardTitle>
            </div>
            <CardDescription>
              Please log in to access the reporting dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={cn("text-sm text-slate-500 dark:text-slate-400")}>
              You need to be authenticated to view reports and analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={cn("flex items-center justify-center p-6")}>
        <Card className={cn("w-full max-w-md border-red-500")}>
          <CardHeader>
            <div className={cn("flex items-center gap-3")}>
              <ShieldAlert className={cn("h-8 w-8 text-red-500")} />
              <CardTitle className={cn("text-red-500")}>
                Access Denied
              </CardTitle>
            </div>
            <CardDescription>
              You don't have permission to access this resource
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("space-y-3")}>
            <p className={cn("text-sm text-slate-500 dark:text-slate-400")}>
              The reporting dashboard is restricted to administrators only.
            </p>
            <p className={cn("text-sm text-slate-500 dark:text-slate-400")}>
              If you believe this is an error, please contact your system
              administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-3 sm:p-4 md:p-6"
      )}
    >
      <div className={cn("max-w-7xl mx-auto space-y-4 sm:space-y-6")}>
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-2xl sm:text-3xl")}>
              Analytics Dashboard
            </CardTitle>
            <CardDescription className={cn("text-sm sm:text-base")}>
              Real-time insights from booking data across all theaters
            </CardDescription>
          </CardHeader>
        </Card>

        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          )}
        >
          <Card
            style={{
              background:
                "linear-gradient(to bottom right, rgb(139, 92, 246), rgb(124, 58, 237))",
              border: "0",
            }}
          >
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between space-y-0 pb-2"
              )}
            >
              <CardTitle className={cn("text-sm font-medium")}>
                Total Revenue
              </CardTitle>
              <svg
                className={cn("w-8 h-8 opacity-80")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold")}>
                ${totalRevenue.toFixed(2)}
              </div>
              <p className={cn("text-sm mt-2 opacity-90")}>
                {flattenedBookings.length} total bookings
              </p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "bg-gradient-to-br from-pink-500 to-pink-600 border-0 text-white"
            )}
          >
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between space-y-0 pb-2"
              )}
            >
              <CardTitle className={cn("text-sm font-medium")}>
                Avg Booking Value
              </CardTitle>
              <svg
                className={cn("w-8 h-8 opacity-80")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold")}>
                ${avgBookingValue.toFixed(2)}
              </div>
              <p className={cn("text-sm mt-2 opacity-90")}>Per transaction</p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "bg-gradient-to-br from-cyan-500 to-cyan-600 border-0 text-white"
            )}
          >
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between space-y-0 pb-2"
              )}
            >
              <CardTitle className={cn("text-sm font-medium")}>
                Total Seats Sold
              </CardTitle>
              <svg
                className={cn("w-8 h-8 opacity-80")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold")}>{totalSeats}</div>
              <p className={cn("text-sm mt-2 opacity-90")}>
                Across all bookings
              </p>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "bg-gradient-to-br from-emerald-500 to-emerald-600 border-0 text-white"
            )}
          >
            <CardHeader
              className={cn(
                "flex flex-row items-center justify-between space-y-0 pb-2"
              )}
            >
              <CardTitle className={cn("text-sm font-medium")}>
                Active Movies
              </CardTitle>
              <svg
                className={cn("w-8 h-8 opacity-80")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold")}>
                {movieRevenueData.length}
              </div>
              <p className={cn("text-sm mt-2 opacity-90")}>Unique movies</p>
            </CardContent>
          </Card>
        </div>

        <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6")}>
          <Card className={cn("w-full")}>
            <CardHeader>
              <CardTitle>Revenue by Movie</CardTitle>
              <CardDescription>
                Top performing movies by revenue
              </CardDescription>
            </CardHeader>
            <CardContent className={cn("px-2 sm:px-6")}>
              {movieRevenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={movieRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="movie"
                      stroke="#64748b"
                      fontSize={10}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "6px",
                        color: "#fff",
                      }}
                      formatter={(value: number) => [
                        `$${value.toFixed(2)}`,
                        "Revenue",
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar
                      dataKey="revenue"
                      fill="#8b5cf6"
                      name="Revenue ($)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className={cn(
                    "h-[300px] flex items-center justify-center text-muted-foreground"
                  )}
                >
                  No booking data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={cn("w-full")}>
            <CardHeader>
              <CardTitle>Bookings by Theater</CardTitle>
              <CardDescription>
                Distribution of bookings across theaters
              </CardDescription>
            </CardHeader>
            <CardContent className={cn("px-2 sm:px-6")}>
              {theaterData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={theaterData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props) => {
                        const percent = props.percent as number;
                        return `${(percent * 100).toFixed(0)}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="bookings"
                    >
                      {theaterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "6px",
                        color: "#fff",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      formatter={(_, entry: any) => entry.payload.theater}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  className={cn(
                    "h-[300px] flex items-center justify-center text-muted-foreground"
                  )}
                >
                  No theater data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings & Revenue Trend</CardTitle>
            <CardDescription>
              Daily booking and revenue trends over time
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("px-2 sm:px-6")}>
            {dailyBookingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyBookingsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#64748b"
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "6px",
                      color: "#fff",
                    }}
                    formatter={(value: number, name: string) =>
                      name === "revenue"
                        ? [`$${value.toFixed(2)}`, "Revenue"]
                        : [value, "Bookings"]
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    name="Bookings"
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Revenue ($)"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className={cn(
                  "h-[300px] flex items-center justify-center text-muted-foreground"
                )}
              >
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>
        {/* 
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Movies</CardTitle>
            <CardDescription>
              Ranking based on total revenue generated
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("px-0 sm:px-6")}>
            {movieRevenueData.length > 0 ? (
              <div className={cn("overflow-x-auto")}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={cn("w-12 sm:w-16")}>Rank</TableHead>
                      <TableHead>Movie</TableHead>
                      <TableHead className={cn("text-right")}>
                        Bookings
                      </TableHead>
                      <TableHead className={cn("text-right")}>
                        Revenue
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movieRevenueData.map((movie, index) => (
                      <TableRow key={movie.movie}>
                        <TableCell
                          className={cn("font-medium text-xs sm:text-sm")}
                        >
                          #{index + 1}
                        </TableCell>
                        <TableCell
                          className={cn("font-medium text-xs sm:text-sm")}
                        >
                          {movie.movie}
                        </TableCell>
                        <TableCell
                          className={cn("text-right text-xs sm:text-sm")}
                        >
                          {movie.bookings}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold text-xs sm:text-sm"
                          )}
                        >
                          ${movie.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className={cn("py-8 text-center text-muted-foreground")}>
                No movie data available yet
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}
