export interface FollowUpRecord {
  date: string;
  note: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatar: string;
  ziWeiChart?: string;
  followUpRecords: FollowUpRecord[];
}

export type StudentLevel = '新流量' | '门票3980' | '单科39800' | '易学弟子69800' | '国学弟子169800';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  wechatId?: string;
  city?: string;
  birthInfo?: {
    date: string;
    time: string;
    type: 'solar' | 'lunar';
  };
  avatar: string;
  ziWeiChart?: string;
  fengShuiImages?: string[];
  status: 'to-follow' | 'closed' | 'following';
  level: StudentLevel;
  nextFollowUpDate?: string; // ISO date string
  followUpRecords: FollowUpRecord[];
  familyMembers?: FamilyMember[];
  archived?: boolean;
  syncStatus?: 'idle' | 'uploading' | 'failed';
}

export interface Activity {
  id: string;
  time: string;
  content: string;
  type: 'update' | 'submit';
}

export interface Stats {
  totalStudents: number;
  purchaseIntent: string;
  followUpsToday: number;
}
