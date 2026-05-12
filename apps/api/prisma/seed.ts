import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { buildGapReport, computeMatchScore } from '../src/lib/matching';
import { APPLICATION_STATUS, JOB_TYPE, ROLE } from '../src/lib/constants';
import { stringifyStringArray } from '../src/lib/jsonFields';

const prisma = new PrismaClient();

async function upsertSkill(name: string, category: string, marketDemandScore: number) {
  return prisma.skill.upsert({
    where: { name },
    update: { category, marketDemandScore },
    create: { name, category, aliasesJson: '[]', marketDemandScore },
  });
}

async function main(): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.application.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.skill.deleteMany();

  const skillRows = [
    ['React', 'Frontend', 92],
    ['TypeScript', 'Languages', 90],
    ['Next.js', 'Frontend', 78],
    ['CSS', 'Frontend', 80],
    ['GraphQL', 'API', 55],
    ['Node.js', 'Backend', 85],
    ['PostgreSQL', 'Data', 82],
    ['Docker', 'DevOps', 75],
    ['Go', 'Languages', 70],
    ['Kubernetes', 'DevOps', 72],
    ['AWS', 'Cloud', 88],
    ['gRPC', 'API', 45],
    ['Redis', 'Data', 70],
    ['React Native', 'Mobile', 68],
    ['Expo', 'Mobile', 60],
    ['Linux', 'Systems', 65],
    ['CI/CD', 'DevOps', 74],
  ] as const;

  const skills: Record<string, { id: string }> = {};
  for (const [name, category, score] of skillRows) {
    const s = await upsertSkill(name, category, score);
    skills[name] = { id: s.id };
  }

  const techCorp = await prisma.company.create({
    data: {
      name: 'TechCorp',
      industry: 'Technology',
      size: '500-1000',
      isVerified: true,
      verificationBadge: 'GSTIN',
      website: 'https://techcorp.example',
      description: 'TechCorp builds modern web platforms for global customers.',
    },
  });

  const startupXyz = await prisma.company.create({
    data: {
      name: 'StartupXYZ',
      industry: 'Technology',
      size: '11-50',
      isVerified: true,
      verificationBadge: 'MCA',
      website: 'https://startupxyz.example',
      description: 'StartupXYZ is a fast-moving product company shipping weekly.',
    },
  });

  const bigTech = await prisma.company.create({
    data: {
      name: 'BigTech',
      industry: 'Cloud',
      size: '10000+',
      isVerified: false,
      description: 'BigTech operates large-scale distributed systems.',
    },
  });

  const mobileFirst = await prisma.company.create({
    data: {
      name: 'MobileFirst',
      industry: 'Mobile',
      size: '51-200',
      isVerified: true,
      verificationBadge: 'MANUAL',
      description: 'MobileFirst ships consumer mobile experiences.',
    },
  });

  const cloudScale = await prisma.company.create({
    data: {
      name: 'CloudScale',
      industry: 'DevOps',
      size: '201-500',
      isVerified: true,
      verificationBadge: 'GSTIN',
      description: 'CloudScale helps teams ship reliable infrastructure.',
    },
  });

  const adminPassword = await bcrypt.hash('SkillGapAdmin1!', 12);
  const demoPassword = await bcrypt.hash('SkillGapDemo1!', 12);
  const companyPassword = await bcrypt.hash('SkillGapCompany1!', 12);

  await prisma.user.create({
    data: {
      email: 'admin@skillgap.ai',
      passwordHash: adminPassword,
      name: 'SkillGap Admin',
      role: ROLE.ADMIN,
      skillsJson: stringifyStringArray([]),
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@skillgap.ai',
      passwordHash: demoPassword,
      name: 'Jordan Demo',
      role: ROLE.CANDIDATE,
      skillsJson: stringifyStringArray(['React', 'TypeScript', 'JavaScript', 'CSS', 'Git', 'Node.js']),
    },
  });

  await prisma.user.create({
    data: {
      email: 'careers@techcorp.example',
      passwordHash: companyPassword,
      name: 'TechCorp Recruiting',
      role: ROLE.COMPANY,
      companyId: techCorp.id,
      skillsJson: stringifyStringArray([]),
    },
  });

  const jobFe = await prisma.job.create({
    data: {
      companyId: techCorp.id,
      title: 'Senior Frontend Engineer',
      description:
        "We're looking for an experienced Frontend Engineer to join our growing team. You'll work on cutting-edge web applications using React and TypeScript, collaborating with designers and backend engineers to deliver exceptional user experiences.",
      requirementsJson: stringifyStringArray([
        '5+ years of experience with React and modern JavaScript',
        'Strong TypeScript knowledge',
        'Experience with state management (Zustand, Redux)',
        'Proficiency with CSS and responsive design',
        'Excellent communication skills',
        'Experience with testing frameworks (Jest, Playwright)',
      ]),
      responsibilitiesJson: stringifyStringArray([
        'Build and maintain frontend applications',
        'Collaborate with product and design teams',
        'Optimize performance and user experience',
        'Mentor junior developers',
        'Participate in code reviews and architecture decisions',
      ]),
      location: 'San Francisco, CA',
      type: JOB_TYPE.FULL_TIME,
      isVerified: true,
      salaryMin: 150000,
      salaryMax: 200000,
      skills: {
        create: [
          { skillId: skills.React!.id },
          { skillId: skills.TypeScript!.id },
          { skillId: skills['Next.js']!.id },
          { skillId: skills.CSS!.id },
          { skillId: skills.GraphQL!.id },
        ],
      },
    },
  });

  const jobFs = await prisma.job.create({
    data: {
      companyId: startupXyz.id,
      title: 'Full Stack Developer',
      description: 'Own features end-to-end across React and Node services.',
      requirementsJson: stringifyStringArray(['Node.js', 'React', 'PostgreSQL', 'Docker']),
      responsibilitiesJson: stringifyStringArray(['Ship features', 'Improve reliability', 'Collaborate across teams']),
      location: 'Remote',
      type: JOB_TYPE.FULL_TIME,
      isVerified: true,
      salaryMin: 120000,
      salaryMax: 160000,
      skills: {
        create: [
          { skillId: skills['Node.js']!.id },
          { skillId: skills.React!.id },
          { skillId: skills.PostgreSQL!.id },
          { skillId: skills.Docker!.id },
        ],
      },
    },
  });

  const jobBe = await prisma.job.create({
    data: {
      companyId: bigTech.id,
      title: 'Backend Engineer',
      description: 'Build distributed systems at scale.',
      requirementsJson: stringifyStringArray(['Go', 'Kubernetes', 'AWS', 'gRPC', 'Redis']),
      responsibilitiesJson: stringifyStringArray(['Design APIs', 'Operate services', 'Improve performance']),
      location: 'Seattle, WA',
      type: JOB_TYPE.FULL_TIME,
      isVerified: false,
      salaryMin: 160000,
      salaryMax: 210000,
      skills: {
        create: [
          { skillId: skills.Go!.id },
          { skillId: skills.Kubernetes!.id },
          { skillId: skills.AWS!.id },
          { skillId: skills.gRPC!.id },
          { skillId: skills.Redis!.id },
        ],
      },
    },
  });

  const jobRn = await prisma.job.create({
    data: {
      companyId: mobileFirst.id,
      title: 'React Native Developer',
      description: 'Ship polished mobile apps with Expo and TypeScript.',
      requirementsJson: stringifyStringArray(['React Native', 'TypeScript', 'Expo']),
      responsibilitiesJson: stringifyStringArray(['Implement UI', 'Integrate APIs', 'Improve performance']),
      location: 'Austin, TX',
      type: JOB_TYPE.CONTRACT,
      isVerified: true,
      salaryMin: 110000,
      salaryMax: 140000,
      skills: {
        create: [
          { skillId: skills['React Native']!.id },
          { skillId: skills.TypeScript!.id },
          { skillId: skills.Expo!.id },
        ],
      },
    },
  });

  await prisma.job.create({
    data: {
      companyId: cloudScale.id,
      title: 'DevOps Intern',
      description: 'Learn CI/CD and cloud fundamentals with a supportive team.',
      requirementsJson: stringifyStringArray(['Docker', 'CI/CD', 'Linux']),
      responsibilitiesJson: stringifyStringArray(['Maintain pipelines', 'Document runbooks', 'Shadow on-call']),
      location: 'Remote',
      type: JOB_TYPE.INTERNSHIP,
      isVerified: true,
      salaryMin: 30,
      salaryMax: 40,
      skills: {
        create: [
          { skillId: skills.Docker!.id },
          { skillId: skills['CI/CD']!.id },
          { skillId: skills.Linux!.id },
        ],
      },
    },
  });

  const demoSkillNames = ['React', 'TypeScript', 'JavaScript', 'CSS', 'Git', 'Node.js'];

  async function seedApplication(
    jobId: string,
    jobTitle: string,
    jobSkillNames: string[],
    requirements: string[],
    status: string,
    rejectionReason?: string,
  ) {
    const matchScore = computeMatchScore(demoSkillNames, jobSkillNames);

    const app = await prisma.application.create({
      data: {
        candidateId: demoUser.id,
        jobId,
        status,
        matchScore,
        ...(rejectionReason ? { rejectionReason } : {}),
      },
    });

    const gapReport = buildGapReport({
      applicationId: app.id,
      candidateSkills: demoSkillNames,
      jobTitle,
      jobSkillNames,
      requirements,
    });

    await prisma.application.update({
      where: { id: app.id },
      data: { gapReportJson: JSON.stringify(gapReport) },
    });
  }

  await seedApplication(
    jobFe.id,
    'Senior Frontend Engineer',
    ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL'],
    JSON.parse(jobFe.requirementsJson) as string[],
    APPLICATION_STATUS.UNDER_REVIEW,
  );

  await seedApplication(
    jobFs.id,
    'Full Stack Developer',
    ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    JSON.parse(jobFs.requirementsJson) as string[],
    APPLICATION_STATUS.INTERVIEW_SCHEDULED,
  );

  await seedApplication(
    jobBe.id,
    'Backend Engineer',
    ['Go', 'Kubernetes', 'AWS', 'gRPC', 'Redis'],
    JSON.parse(jobBe.requirementsJson) as string[],
    APPLICATION_STATUS.REJECTED,
    'Strong systems background required. We are moving forward with candidates who have deeper production Kubernetes and on-call experience.',
  );

  await seedApplication(
    jobRn.id,
    'React Native Developer',
    ['React Native', 'TypeScript', 'Expo'],
    JSON.parse(jobRn.requirementsJson) as string[],
    APPLICATION_STATUS.OFFER_EXTENDED,
  );

  console.log('Seed complete.');
  console.log('Accounts:');
  console.log('- admin@skillgap.ai / SkillGapAdmin1!');
  console.log('- demo@skillgap.ai / SkillGapDemo1!');
  console.log('- careers@techcorp.example / SkillGapCompany1!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
