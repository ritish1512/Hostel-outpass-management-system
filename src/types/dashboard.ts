import { LeaveType } from "@/generated/prisma";
export interface department {
  name: string,
}
export interface student {
  name: string,
  semester: number,
  section: string,
  department: department,
  HostelRoomNo: number
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