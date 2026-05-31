import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { buildGapReport, computeMatchScore } from '../src/lib/matching';
import {
  APPLICATION_STATUS,
  AUDIT_ACTION,
  COMPANY_VERIFICATION_STATUS,
  JOB_TYPE,
  ROLE,
  VERIFICATION_DOCUMENT_TYPE,
} from '../src/lib/constants';
import { stringifyJson, stringifyStringArray } from '../src/lib/jsonFields';
import { clearDatabase } from './clear-data';

const prisma = new PrismaClient();

async function upsertSkill(name: string, category: string, marketDemandScore: number) {
  return prisma.skill.upsert({
    where: { name },
    update: { category, marketDemandScore },
    create: { name, category, aliasesJson: '[]', marketDemandScore },
  });
}

async function main(): Promise<void> {
  await clearDatabase({ skipConfirmation: true }, prisma);

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
      verificationStatus: 'VERIFIED',
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
      verificationStatus: 'VERIFIED',
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
      verificationStatus: 'VERIFIED',
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
      verificationStatus: 'VERIFIED',
      verificationBadge: 'GSTIN',
      description: 'CloudScale helps teams ship reliable infrastructure.',
    },
  });

  const adminPassword = await bcrypt.hash('SkillGapAdmin1!', 12);
  const demoPassword = await bcrypt.hash('SkillGapDemo1!', 12);
  const companyPassword = await bcrypt.hash('SkillGapCompany1!', 12);

  const adminUser = await prisma.user.create({
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
      title: 'Frontend Engineer',
      location: 'Bengaluru, India',
      summary:
        'Frontend engineer focused on accessible React apps, TypeScript systems, and product-minded collaboration.',
      phone: '+91 90000 11111',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
      skillsJson: stringifyStringArray([
        'React',
        'TypeScript',
        'JavaScript',
        'CSS',
        'Git',
        'Node.js',
      ]),
      skillLevelsJson: stringifyJson([
        { name: 'React', level: 'ADVANCED' },
        { name: 'TypeScript', level: 'ADVANCED' },
        { name: 'Node.js', level: 'INTERMEDIATE' },
        { name: 'CSS', level: 'ADVANCED' },
      ]),
      educationJson: stringifyJson([
        {
          school: 'Anna University',
          degree: 'B.Tech',
          field: 'Computer Science',
          startYear: 2020,
          endYear: 2024,
          gpa: '8.7',
        },
      ]),
      experienceJson: stringifyJson([
        {
          company: 'PixelWorks Studio',
          role: 'Frontend Intern',
          startDate: 'Jan 2024',
          endDate: 'Jun 2024',
          summary: 'Built reusable dashboard components with React, TypeScript, and Tailwind CSS.',
        },
      ]),
      internshipsJson: stringifyJson([
        {
          company: 'SkillSprint Labs',
          role: 'Web Developer Intern',
          startDate: 'May 2023',
          endDate: 'Aug 2023',
          summary: 'Implemented responsive landing pages and API-backed forms.',
        },
      ]),
      projectsJson: stringifyJson([
        {
          name: 'SkillGap Portfolio',
          stack: ['React', 'TypeScript', 'Node.js'],
          link: 'https://github.com/skillgap/demo-portfolio',
          summary: 'A candidate profile and job match dashboard.',
        },
      ]),
      linksJson: stringifyJson([
        { label: 'GitHub', url: 'https://github.com/skillgap-demo' },
        { label: 'LinkedIn', url: 'https://linkedin.com/in/skillgap-demo' },
      ]),
      resumeUrl: 'https://example.com/resumes/jordan-demo.pdf',
      resumeStatus: 'VERIFIED',
      resumeVerifiedAt: new Date(),
      emailVerified: true,
      skillsVerified: true,
    },
  });

  const alexUser = await prisma.user.create({
    data: {
      email: 'alex.backend@example.com',
      passwordHash: demoPassword,
      name: 'Alex Backend',
      role: ROLE.CANDIDATE,
      title: 'Backend Engineer',
      location: 'Hyderabad, India',
      summary: 'Backend engineer with API, PostgreSQL, Docker, and cloud deployment experience.',
      skillsJson: stringifyStringArray(['Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Redis']),
      skillLevelsJson: stringifyJson([
        { name: 'Node.js', level: 'ADVANCED' },
        { name: 'PostgreSQL', level: 'ADVANCED' },
        { name: 'Docker', level: 'INTERMEDIATE' },
        { name: 'AWS', level: 'INTERMEDIATE' },
      ]),
      educationJson: stringifyJson([
        {
          school: 'BITS Pilani',
          degree: 'B.E.',
          field: 'Information Systems',
          startYear: 2019,
          endYear: 2023,
        },
      ]),
      experienceJson: stringifyJson([
        {
          company: 'APIWorks',
          role: 'Junior Backend Engineer',
          startDate: 'Jul 2023',
          summary: 'Owned REST services, query optimization, and containerized deployments.',
        },
      ]),
      linksJson: stringifyJson([{ label: 'Portfolio', url: 'https://alex.example.com' }]),
      emailVerified: true,
      skillsVerified: true,
    },
  });

  const riyaUser = await prisma.user.create({
    data: {
      email: 'riya.mobile@example.com',
      passwordHash: demoPassword,
      name: 'Riya Mobile',
      role: ROLE.CANDIDATE,
      title: 'React Native Developer',
      location: 'Chennai, India',
      summary: 'Mobile developer building Expo and React Native apps with polished user flows.',
      skillsJson: stringifyStringArray(['React Native', 'Expo', 'TypeScript', 'React']),
      skillLevelsJson: stringifyJson([
        { name: 'React Native', level: 'ADVANCED' },
        { name: 'Expo', level: 'ADVANCED' },
        { name: 'TypeScript', level: 'INTERMEDIATE' },
      ]),
      educationJson: stringifyJson([
        {
          school: 'VIT',
          degree: 'B.Tech',
          field: 'Software Engineering',
          startYear: 2020,
          endYear: 2024,
        },
      ]),
      projectsJson: stringifyJson([
        {
          name: 'Campus Connect App',
          stack: ['React Native', 'Expo', 'TypeScript'],
          summary: 'A mobile app for student events, alerts, and club discovery.',
        },
      ]),
      emailVerified: true,
    },
  });

  const techCorpRecruiter = await prisma.user.create({
    data: {
      email: 'careers@techcorp.example',
      passwordHash: companyPassword,
      name: 'TechCorp Recruiting',
      role: ROLE.COMPANY,
      companyId: techCorp.id,
      skillsJson: stringifyStringArray([]),
    },
  });

  await prisma.user.create({
    data: {
      email: 'hiring@startupxyz.example',
      passwordHash: companyPassword,
      name: 'StartupXYZ Hiring',
      role: ROLE.COMPANY,
      companyId: startupXyz.id,
      skillsJson: stringifyStringArray([]),
      emailVerified: true,
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
      responsibilitiesJson: stringifyStringArray([
        'Ship features',
        'Improve reliability',
        'Collaborate across teams',
      ]),
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
      responsibilitiesJson: stringifyStringArray([
        'Design APIs',
        'Operate services',
        'Improve performance',
      ]),
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
      responsibilitiesJson: stringifyStringArray([
        'Implement UI',
        'Integrate APIs',
        'Improve performance',
      ]),
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
      responsibilitiesJson: stringifyStringArray([
        'Maintain pipelines',
        'Document runbooks',
        'Shadow on-call',
      ]),
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

  async function seedApplication(
    candidate: { id: string; name: string; skillsJson: string },
    jobId: string,
    jobTitle: string,
    jobSkillNames: string[],
    requirements: string[],
    status: string,
    rejectionReason?: string,
  ) {
    const candidateSkills = JSON.parse(candidate.skillsJson) as string[];
    const matchScore = computeMatchScore(candidateSkills, jobSkillNames);

    const app = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId,
        status,
        matchScore,
        ...(rejectionReason ? { rejectionReason } : {}),
        coverNote: `I am excited about ${jobTitle} and can contribute with ${candidateSkills.slice(0, 3).join(', ')}.`,
      },
    });

    const gapReport = buildGapReport({
      applicationId: app.id,
      candidateSkills,
      jobTitle,
      jobSkillNames,
      requirements,
    });

    await prisma.application.update({
      where: { id: app.id },
      data: { gapReportJson: JSON.stringify(gapReport) },
    });

    await prisma.aiExplanation.create({
      data: {
        applicationId: app.id,
        type: 'GAP_REPORT',
        model: 'deterministic-skillgap-v1',
        promptVersion: 'seed-gap-report-v1',
        confidence: Math.max(30, Math.min(98, gapReport.overallMatchPercent)),
        summary: `${candidate.name} has a ${gapReport.overallMatchPercent}% match for ${jobTitle}.`,
        missingSkillsJson: gapReport.criticalGaps as unknown as Prisma.InputJsonValue,
        weakEvidenceJson: gapReport.partialMatches as unknown as Prisma.InputJsonValue,
        strengthsJson: gapReport.strengths as unknown as Prisma.InputJsonValue,
        recommendationsJson: gapReport.recommendations as unknown as Prisma.InputJsonValue,
        rawOutputJson: gapReport as unknown as Prisma.InputJsonValue,
        generatedBy: 'seed',
      },
    });

    return app;
  }

  await seedApplication(
    demoUser,
    jobFe.id,
    'Senior Frontend Engineer',
    ['React', 'TypeScript', 'Next.js', 'CSS', 'GraphQL'],
    JSON.parse(jobFe.requirementsJson) as string[],
    APPLICATION_STATUS.UNDER_REVIEW,
  );

  await seedApplication(
    alexUser,
    jobFs.id,
    'Full Stack Developer',
    ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    JSON.parse(jobFs.requirementsJson) as string[],
    APPLICATION_STATUS.INTERVIEW_SCHEDULED,
  );

  const rejectedApp = await seedApplication(
    demoUser,
    jobBe.id,
    'Backend Engineer',
    ['Go', 'Kubernetes', 'AWS', 'gRPC', 'Redis'],
    JSON.parse(jobBe.requirementsJson) as string[],
    APPLICATION_STATUS.REJECTED,
    'Strong systems background required. We are moving forward with candidates who have deeper production Kubernetes and on-call experience.',
  );

  await seedApplication(
    riyaUser,
    jobRn.id,
    'React Native Developer',
    ['React Native', 'TypeScript', 'Expo'],
    JSON.parse(jobRn.requirementsJson) as string[],
    APPLICATION_STATUS.OFFER_EXTENDED,
  );

  await prisma.aiExplanation.create({
    data: {
      applicationId: rejectedApp.id,
      type: 'REJECTION_REASON',
      model: 'structured-rejection-v1',
      promptVersion: 'seed-rejection-v1',
      confidence: 82,
      summary:
        'Rejected due to missing evidence for production Kubernetes, gRPC, and distributed systems operation.',
      missingSkillsJson: [] as unknown as Prisma.InputJsonValue,
      weakEvidenceJson: [
        {
          skillName: 'Kubernetes',
          required: 'Production Kubernetes ownership',
          candidate: 'No production cluster evidence in profile',
          severity: 'MODERATE',
          explanation: 'The resume does not show hands-on production Kubernetes operations.',
        },
      ] as unknown as Prisma.InputJsonValue,
      strengthsJson: [
        'Strong frontend and TypeScript evidence',
      ] as unknown as Prisma.InputJsonValue,
      recommendationsJson: [] as unknown as Prisma.InputJsonValue,
      rawOutputJson: { source: 'seed' } as Prisma.InputJsonValue,
      generatedBy: 'recruiter',
    },
  });

  const submittedVerification = await prisma.companyVerification.create({
    data: {
      companyId: bigTech.id,
      status: COMPANY_VERIFICATION_STATUS.SUBMITTED,
      region: 'GLOBAL',
      countryCode: 'US',
      submittedById: techCorpRecruiter.id,
      fraudScore: 42,
      submittedAt: new Date(),
      metadataJson: { registrationNumber: 'BT-DEMO-1024' },
    },
  });

  await prisma.verificationDocument.createMany({
    data: [
      {
        companyId: bigTech.id,
        verificationId: submittedVerification.id,
        type: VERIFICATION_DOCUMENT_TYPE.BUSINESS_REGISTRATION,
        originalName: 'business-registration-demo.pdf',
        storageKey: 'seed/bigtech/business-registration-demo.pdf',
        contentType: 'application/pdf',
        sizeBytes: 482_000,
        checksumSha256: 'seed-business-registration-checksum',
        malwareScanStatus: 'CLEAN',
        status: 'UPLOADED',
        uploadedById: techCorpRecruiter.id,
      },
      {
        companyId: bigTech.id,
        verificationId: submittedVerification.id,
        type: VERIFICATION_DOCUMENT_TYPE.TAX_DOCUMENT,
        originalName: 'tax-document-demo.pdf',
        storageKey: 'seed/bigtech/tax-document-demo.pdf',
        contentType: 'application/pdf',
        sizeBytes: 318_000,
        checksumSha256: 'seed-tax-document-checksum',
        malwareScanStatus: 'CLEAN',
        status: 'UPLOADED',
        uploadedById: techCorpRecruiter.id,
      },
    ],
  });

  await prisma.fraudFlag.create({
    data: {
      companyId: bigTech.id,
      verificationId: submittedVerification.id,
      severity: 'MEDIUM',
      reason: 'Website domain and uploaded document issuer are from different regions.',
      status: 'OPEN',
      evidenceJson: { websiteCountry: 'US', documentIssuerCountry: 'SG' },
    },
  });

  await prisma.adminReview.create({
    data: {
      entityType: 'CompanyVerification',
      entityId: submittedVerification.id,
      companyId: bigTech.id,
      verificationId: submittedVerification.id,
      createdById: adminUser.id,
      status: 'OPEN',
      notes: 'Review uploaded registration documents and resolve the regional mismatch flag.',
    },
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: adminUser.id,
        actorRole: ROLE.ADMIN,
        action: AUDIT_ACTION.COMPANY_VERIFICATION_CREATED,
        entityType: 'CompanyVerification',
        entityId: submittedVerification.id,
        metadataJson: { source: 'seed' },
      },
      {
        actorId: techCorpRecruiter.id,
        actorRole: ROLE.COMPANY,
        action: AUDIT_ACTION.JOB_CREATED,
        entityType: 'Job',
        entityId: jobFe.id,
        metadataJson: { source: 'seed' },
      },
      {
        actorId: demoUser.id,
        actorRole: ROLE.CANDIDATE,
        action: AUDIT_ACTION.AUTH_LOGIN_SUCCESS,
        entityType: 'User',
        entityId: demoUser.id,
        metadataJson: { demo: true },
      },
    ],
  });

  await prisma.legalAcceptance.createMany({
    data: [
      { userId: demoUser.id, documentType: 'TERMS', version: '2026-05' },
      { userId: techCorpRecruiter.id, documentType: 'TERMS', version: '2026-05' },
    ],
  });

  await prisma.cookieConsent.create({
    data: {
      userId: demoUser.id,
      essential: true,
      analytics: true,
      marketing: false,
      preferences: true,
      policyVersion: '2026-05',
    },
  });

  console.log('Seed complete.');
  console.log('Accounts:');
  console.log('- admin@skillgap.ai / SkillGapAdmin1!');
  console.log('- demo@skillgap.ai / SkillGapDemo1!');
  console.log('- alex.backend@example.com / SkillGapDemo1!');
  console.log('- riya.mobile@example.com / SkillGapDemo1!');
  console.log('- careers@techcorp.example / SkillGapCompany1!');
  console.log('- hiring@startupxyz.example / SkillGapCompany1!');
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
