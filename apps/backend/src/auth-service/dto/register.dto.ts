export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'tutor';
  phone?: string;
}

export interface RegisterResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}
