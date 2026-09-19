export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  summary: string;
  image: any;
};

export const announcements = [
  { id: 'a1', icon: 'library-outline', title: 'Library Extended Hours', body: 'Open until 10 PM during exam preparation week.', meta: 'Today • Academic', important: true },
  { id: 'a2', icon: 'construct-outline', title: 'Maintenance Notice', body: 'A short facilities maintenance window is scheduled.', meta: 'Yesterday • Facilities', important: false },
  { id: 'a3', icon: 'document-text-outline', title: 'Exam Timetable Update', body: 'Check your semester assessment timetable and room details.', meta: '2 days ago • Academic', important: false },
  { id: 'a4', icon: 'school-outline', title: 'Foundation Programme Award Ceremony', body: 'UCL celebrated students completing Foundation Programmes in IT and Business.', meta: 'Academic • UCL News', important: false },
  { id: 'a5', icon: 'briefcase-outline', title: 'Career Fair ’26', body: 'Career Fair ’26 connected students with employment opportunities from leading organisations.', meta: 'Careers • UCL Event', important: false }
];

export const events: EventItem[] = [
  {
    id: 'e1',
    title: 'Career Fair ’26: Where Careers Begin',
    date: '22 Jun 2026',
    time: '10:00 AM – 4:00 PM',
    location: 'Universal College Lanka',
    category: 'Careers',
    summary: 'A UCL career event connecting students with employment opportunities from leading organisations in Sri Lanka.',
    image: { uri: 'https://ucl.lk/wp-content/uploads/2026/06/IMG_1385-1024x575.jpg' }
  },
  {
    id: 'e2',
    title: 'UCL Future Leaders Forum 2026',
    date: '2026',
    time: 'Full-day programme',
    location: 'UCL Rajagiriya',
    category: 'Leadership',
    summary: 'An interactive leadership experience organised by UCL in collaboration with Monash College for school prefects and student leaders.',
    image: { uri: 'https://ucl.lk/wp-content/uploads/2026/07/K7_4982-1-1024x683.jpg' }
  },
  {
    id: 'e3',
    title: 'From Source to Supply',
    date: '8 Jun 2026',
    time: 'Field visit',
    location: 'Ambatale Water Treatment Plant',
    category: 'Engineering',
    summary: 'Monash Engineering students explored water-treatment systems and infrastructure in a practical field visit.',
    image: { uri: 'https://ucl.lk/wp-content/uploads/2026/06/IMG_0530-1024x575.jpg' }
  },
  {
    id: 'e4',
    title: 'Shaping the Future of Marketing',
    date: '23 Jul 2026',
    time: 'Masterclass',
    location: 'Universal College Lanka',
    category: 'Masterclass',
    summary: 'A Future of Work Series conversation bringing marketers and industry professionals together to discuss where marketing is headed.',
    image: { uri: 'https://ucl.lk/wp-content/uploads/2026/07/IMG_2740-1024x575.jpg' }
  }
];

export const programmeGroups = [
  { title: 'Foundation Programmes', subtitle: 'Build your academic foundation', icon: 'school-outline' },
  { title: 'Pathway Programmes', subtitle: 'Pathways to leading universities', icon: 'git-branch-outline' },
  { title: 'Degree Programmes', subtitle: 'Undergraduate study options', icon: 'ribbon-outline' },
  { title: 'Masters Programmes', subtitle: 'Postgraduate opportunities', icon: 'medal-outline' }
];

export const programmes = [
  ['Monash University Foundation Year (MUFY)', 'Monash College'],
  ['Diploma of Business', 'Monash College'],
  ['Diploma of Engineering', 'Monash College'],
  ['Diploma of IT', 'Monash College'],
  ['Diploma of Science', 'Monash College'],
  ['UCL Foundation Programme', 'University of Lancashire'],
  ['BSc (Hons) Software Engineering', 'University of Lancashire'],
  ['BSc (Hons) Cyber Security', 'University of Lancashire'],
  ['BSc (Hons) AI & Data Science', 'University of Lancashire'],
  ['BSc (Hons) Business and Marketing', 'University of Lancashire'],
  ['BA (Hons) International Business', 'University of Lancashire'],
  ['MSc in Digital Marketing Communications', 'University of Lancashire'],
  ['MSc Data Science', 'University of Lancashire'],
  ['MSc Cyber Security', 'University of Lancashire'],
  ['Bachelor of Business International Hotel Management', 'Torrens University'],
  ['NCC International Foundation Year', 'NCC Global']
] as const;

export const staff = [
  ['Dr. Dhananjay Kulkarni', 'Provost / Head of UCL Research and Consulting Agency (URECA)'],
  ['Dr. Devangi Perera', 'Head of School of Business / Programme Coordinator / Senior Lecturer'],
  ['Mr. Hussain Moosajee', 'Senior Lecturer'],
  ['Ms. Asiri Perera', 'Senior Lecturer'],
  ['Mr. Nalith Fernando', 'Senior Lecturer'],
  ['Mr. Maduranga Pillai', 'Senior Lecturer'],
  ['Mr. Isuru Dhananjaya', 'Senior Lecturer'],
  ['Ms. Shanika Perera', 'Senior Lecturer'],
  ['Ms. Virginia Perera', 'Senior Lecturer'],
  ['Ms. Ravini Caldera', 'Senior Lecturer'],
  ['Ms. Ovini Seneviratne', 'Senior Lecturer']
] as const;

export const calendarItems = [
  ['15 Oct', 'Assignment 1 Deadline', 'Academic'],
  ['20 Oct', 'Mid-Semester Break', 'Campus'],
  ['5 Nov', 'Add/Drop Deadline', 'Academic'],
  ['10 Nov', 'Exam Timetable Release', 'Exam']
] as const;

export const rooms = [
  ['A101', 30, 'Projector • Whiteboard', true],
  ['B203', 50, 'Projector • AC', true],
  ['C105', 25, 'Whiteboard', false],
  ['D301', 40, 'Projector • AC', true]
] as const;

export const lostItems = [
  ['Black wallet', 'Found • Library', 'wallet-outline'],
  ['White earbuds', 'Found • Cafeteria', 'headset-outline'],
  ['Student ID card', 'Found • Block A', 'card-outline'],
  ['Blue water bottle', 'Found • Sports area', 'water-outline']
] as const;

export const societies = [
  ['Young Entrepreneurs Club', 'Business innovation and startup culture', 'bulb-outline'],
  ['STEM Club', 'Science, technology, engineering and mathematics', 'flask-outline'],
  ['Community Service Club', 'Service and community engagement', 'heart-outline'],
  ['Sports Teams', 'Football, basketball, cricket and more', 'football-outline'],
  ['E-Sports', 'Competitive gaming and esports', 'game-controller-outline'],
  ['Converse with Confidence', 'Public speaking and communication skills', 'mic-outline']
] as const;

export const contact = {
  admissions: '+94 77 311 0000',
  general: '011 700 8008 / 077 411 0000',
  email: 'info@ucl.lk',
  officeHours: 'Mon–Fri 9:00 AM–5:00 PM • Sat 9:00 AM–1:00 PM',
  address: '503, Sri Jayawardenepura Mawatha, Rajagiriya, Sri Lanka'
};
