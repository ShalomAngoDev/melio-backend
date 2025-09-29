export class ReportResponseDto {
  id: string;
  schoolId: string;
  studentId?: string;
  content: string;
  urgency: string;
  anonymous: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

