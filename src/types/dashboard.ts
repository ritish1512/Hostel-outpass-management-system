import { LeaveType, Hostel, Role } from "@/generated/prisma";
export interface department {
  name: string,
}
export interface student {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  departmentId: string | null;
  section: string | null;
  semester: number | null;
  HostelName: Hostel | null;
  HostelRoomNo: number | null;
  parentId: string | null;
  createdAt: Date;
  department: department
}
export interface IOutpass {
  id: string;
  studentId: string;
  startDate: Date | string;
  endDate: Date | string;
  reason: string;
  type: LeaveType;
  student: student;
  status: string;
  tier: string;
  createdAt: Date | string;
  outTime?: Date | string | null;
  inTime?: Date | string | null;
}
export default interface dashboardProps {
  outpasses: IOutpass[];
  actorName: string;
}