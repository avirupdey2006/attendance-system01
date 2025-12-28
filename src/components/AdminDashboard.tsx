import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { getAttendanceByDate, getStudents, Student, AttendanceRecord } from '@/lib/attendanceService';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'students'>('attendance');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedStudents, loadedRecords] = await Promise.all([
          getStudents(),
          getAttendanceByDate(new Date(selectedDate))
        ]);
        setStudents(loadedStudents);
        setAttendanceRecords(loadedRecords);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return attendanceRecords;
    
    return attendanceRecords.filter(r => 
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [attendanceRecords, searchQuery]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    return {
      totalStudents: students.length,
      todayAttendance: attendanceRecords.length,
      attendanceRate: students.length > 0 
        ? Math.round((attendanceRecords.length / students.length) * 100) 
        : 0,
      dateLabel: isToday ? "Today's" : 'Selected Date',
    };
  }, [students, attendanceRecords, selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isStudentPresentOnDate = (studentId: string) => {
    return attendanceRecords.some(r => r.student_id === studentId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage student attendance</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : stats.totalStudents}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stats.dateLabel} Attendance</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : stats.todayAttendance}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <LayoutDashboard className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {isLoading ? '...' : `${stats.attendanceRate}%`}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <Calendar className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Selected Date</p>
                <p className="text-lg font-bold text-foreground">
                  {new Date(selectedDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Attendance Records
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'students'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="inline-block h-4 w-4 mr-2" />
              Registered Students
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-border bg-secondary/30">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {activeTab === 'attendance' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : activeTab === 'attendance' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No attendance records found for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.student_name}</TableCell>
                        <TableCell>{record.student_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {new Date(record.marked_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                            <CheckCircle className="h-3 w-3" />
                            Present
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Today's Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No students registered yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => {
                      const isPresent = isStudentPresentOnDate(student.student_id);
                      return (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={student.face_image}
                                alt={student.name}
                                className="h-10 w-10 rounded-full object-cover border-2 border-border"
                              />
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{student.student_id}</TableCell>
                          <TableCell>
                            {new Date(student.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                                <CheckCircle className="h-3 w-3" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                                <XCircle className="h-3 w-3" />
                                Absent
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
