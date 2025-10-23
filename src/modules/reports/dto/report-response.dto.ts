export class ReportResponseDto {
  id: string;
  schoolId: string;
  studentId?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    className: string;
  };
  content: string;
  urgency: string;
  anonymous: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
