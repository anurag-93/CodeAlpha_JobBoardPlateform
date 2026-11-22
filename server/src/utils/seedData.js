import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Resume from '../models/Resume.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { UPLOAD_CONFIG, initUploadDir } from '../config/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async () => {
  try {
    await connectDB();
    initUploadDir();

    console.log(' Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Resume.deleteMany({}),
      Application.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log(' Seeding Users...');
    // 1. Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@jobboard.com',
      password: 'Password123!',
      role: 'admin',
      headline: 'Platform Admin & Operations',
      bio: 'Managing platform integrity, verifications, and compliance.',
      location: 'San Francisco, CA',
    });

    // 2. Employers
    const employer1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'employer@techcorp.io',
      password: 'Password123!',
      role: 'employer',
      headline: 'Head of Talent Acquisition at TechCorp',
      bio: 'Scaling high-performance engineering and product teams across North America & Europe.',
      companyName: 'TechCorp Solutions',
      companyWebsite: 'https://techcorp.io',
      companyDescription: 'Enterprise cloud infrastructure, microservices, and AI workflow automation.',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces',
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
    });

    const employer2 = await User.create({
      name: 'David Vance',
      email: 'talent@innovate.co',
      password: 'Password123!',
      role: 'employer',
      headline: 'VP of People & Culture at InnovateLabs',
      bio: 'Building the future of fintech and collaborative productivity tools.',
      companyName: 'InnovateLabs',
      companyWebsite: 'https://innovate.co',
      companyDescription: 'Next-generation fintech platforms revolutionizing digital transactions globally.',
      companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces',
      location: 'New York, NY',
      phone: '+1 (555) 987-6543',
    });

    // 3. Candidates
    const candidate1 = await User.create({
      name: 'Alex Chen',
      email: 'alex.chen@example.com',
      password: 'Password123!',
      role: 'candidate',
      headline: 'Senior Full Stack Engineer (MERN / TypeScript / AWS)',
      bio: 'Passionate developer with 6+ years building scalable SaaS web apps, distributed backends, and responsive React UIs.',
      location: 'Austin, TX',
      phone: '+1 (555) 345-6789',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
      experienceYears: 6,
    });

    const candidate2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.dev@example.com',
      password: 'Password123!',
      role: 'candidate',
      headline: 'Frontend Engineer & UI/UX Specialist',
      bio: 'Crafting pixel-perfect, accessible, and fast web applications using React, Next.js, and modern CSS.',
      location: 'Seattle, WA',
      phone: '+1 (555) 456-7890',
      skills: ['React', 'JavaScript', 'Tailwind CSS', 'Figma', 'Next.js', 'Redux', 'Jest'],
      experienceYears: 4,
    });

    const candidate3 = await User.create({
      name: 'Marcus Brody',
      email: 'marcus.design@example.com',
      password: 'Password123!',
      role: 'candidate',
      headline: 'Lead Product Designer & UX Researcher',
      bio: '8 years designing multi-platform design systems, interaction patterns, and user journeys for enterprise software.',
      location: 'Chicago, IL',
      phone: '+1 (555) 567-8901',
      skills: ['Product Design', 'UI/UX', 'Figma', 'Design Systems', 'User Research', 'Prototyping'],
      experienceYears: 8,
    });

    console.log(' Seeding Resumes...');
    // Create mock sample resume files in upload directory
    const mockResumePath1 = path.join(UPLOAD_CONFIG.uploadDir, 'alex_chen_resume.pdf');
    const mockResumePath2 = path.join(UPLOAD_CONFIG.uploadDir, 'elena_rostova_resume.pdf');
    fs.writeFileSync(mockResumePath1, '%PDF-1.4 Mock resume content for Alex Chen (Senior Full Stack Engineer)');
    fs.writeFileSync(mockResumePath2, '%PDF-1.4 Mock resume content for Elena Rostova (Frontend Engineer)');

    const resume1 = await Resume.create({
      candidate: candidate1._id,
      title: 'Alex Chen - Full Stack Software Engineer (2026)',
      originalName: 'Alex_Chen_FullStack_Resume.pdf',
      filename: 'alex_chen_resume.pdf',
      filePath: mockResumePath1,
      fileSize: 1048576,
      mimeType: 'application/pdf',
      isDefault: true,
    });

    const resume2 = await Resume.create({
      candidate: candidate2._id,
      title: 'Elena Rostova - Frontend & UI Engineering',
      originalName: 'Elena_Rostova_Frontend_Resume.pdf',
      filename: 'elena_rostova_resume.pdf',
      filePath: mockResumePath2,
      fileSize: 845200,
      mimeType: 'application/pdf',
      isDefault: true,
    });

    console.log(' Seeding Jobs...');
    const jobs = await Job.create([
      {
        title: 'Senior Full Stack Engineer (MERN / TypeScript)',
        description: `We are seeking an experienced Senior Full Stack Engineer to lead architecture and development on our flagship enterprise cloud platform. You will work closely with product managers and distributed engineers to deliver resilient APIs, robust database models, and engaging React interfaces.\n\nOur team values clean code, thorough automated testing, and collaborative design reviews.`,
        employer: employer1._id,
        companyName: 'TechCorp Solutions',
        companyWebsite: 'https://techcorp.io',
        companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces',
        location: 'San Francisco, CA (or Remote)',
        workplaceMode: 'remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salary: {
          min: 145000,
          max: 185000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: true,
        },
        requirements: [
          '5+ years experience building production web applications with React, Node.js, and TypeScript',
          'Deep proficiency with MongoDB, schema optimization, and aggregation pipelines',
          'Solid understanding of RESTful API architecture, authentication (JWT/OAuth), and microservices',
          'Experience deploying on AWS or GCP with Docker containers and CI/CD pipelines',
          'Strong communication skills and enthusiasm for mentoring junior engineers',
        ],
        responsibilities: [
          'Architect and deliver end-to-end features across our React frontend and Node.js microservices',
          'Optimize database queries and indexing to maintain sub-50ms response times at scale',
          'Participate in architectural reviews and enforce secure development best practices',
          'Collaborate across cross-functional squads to scope and ship bi-weekly sprint deliverables',
        ],
        skillsRequired: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express.js', 'Docker', 'AWS'],
        status: 'published',
        applicationsCount: 2,
        viewsCount: 148,
      },
      {
        title: 'Frontend React Developer (Design Systems & Performance)',
        description: `Join TechCorp as a Frontend Developer dedicated to building high-performance, modular UI components and customer dashboards. You will help elevate our user experience through responsive interfaces, smooth micro-interactions, and accessible web standards.`,
        employer: employer1._id,
        companyName: 'TechCorp Solutions',
        companyWebsite: 'https://techcorp.io',
        companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces',
        location: 'San Francisco, CA',
        workplaceMode: 'hybrid',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salary: {
          min: 110000,
          max: 135000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: false,
        },
        requirements: [
          '3+ years professional experience with modern React (hooks, context, state management)',
          'High proficiency with Tailwind CSS or modern CSS-in-JS solutions',
          'Strong grasp of web performance metrics (Core Web Vitals) and browser rendering behavior',
          'Comfortable translating complex Figma wireframes into clean, reusable component libraries',
        ],
        responsibilities: [
          'Build and maintain our shared UI design system and reusable component library',
          'Refactor legacy views into modular, performant React single page applications',
          'Collaborate with UX designers to conduct usability testing and rapid iteration',
        ],
        skillsRequired: ['React', 'JavaScript', 'Tailwind CSS', 'Figma', 'HTML5/CSS3', 'Jest'],
        status: 'published',
        applicationsCount: 1,
        viewsCount: 94,
      },
      {
        title: 'DevOps & Cloud Infrastructure Engineer',
        description: `TechCorp is scaling rapidly and looking for a DevOps Engineer to manage our Kubernetes clusters, Terraform infrastructure, and continuous deployment pipelines. You will ensure high availability, zero-downtime rollouts, and top-tier security observability.`,
        employer: employer1._id,
        companyName: 'TechCorp Solutions',
        companyWebsite: 'https://techcorp.io',
        companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=128&h=128&fit=crop&crop=faces',
        location: 'Austin, TX',
        workplaceMode: 'remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salary: {
          min: 150000,
          max: 190000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: true,
        },
        requirements: [
          '4+ years managing cloud environments on AWS or Google Cloud Platform',
          'Hands-on expertise with Docker, Kubernetes, Helm, and Terraform infrastructure as code',
          'Proficiency with monitoring and observability stacks (Prometheus, Grafana, Datadog)',
          'Experience setting up automated CI/CD pipelines with GitHub Actions or GitLab',
        ],
        responsibilities: [
          'Maintain 99.99% uptime across production clusters and databases',
          'Automate infrastructure provisioning using Terraform and Ansible',
          'Implement disaster recovery runbooks and security compliance controls',
        ],
        skillsRequired: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux'],
        status: 'published',
        applicationsCount: 0,
        viewsCount: 62,
      },
      {
        title: 'Lead Product Designer (Fintech & Payments)',
        description: `InnovateLabs is searching for a visionary Lead Product Designer to guide the future of digital transactions, mobile payments, and financial analytics. You will establish design standards, lead user research, and shape frictionless financial experiences.`,
        employer: employer2._id,
        companyName: 'InnovateLabs',
        companyWebsite: 'https://innovate.co',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces',
        location: 'New York, NY',
        workplaceMode: 'hybrid',
        jobType: 'full-time',
        experienceLevel: 'lead',
        salary: {
          min: 160000,
          max: 200000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: true,
        },
        requirements: [
          '7+ years digital product design experience, preferably in Fintech, Banking, or B2B SaaS',
          'Mastery of Figma, interactive prototyping, and component token systems',
          'Track record of conducting qualitative customer interviews and quantitative analytics reviews',
          'Experience mentoring and leading a team of junior and mid-level designers',
        ],
        responsibilities: [
          'Own end-to-end user journeys for both mobile and web payment platforms',
          'Partner with product managers and engineers to define roadmap milestones',
          'Establish the global InnovateLabs design system and accessibility guidelines',
        ],
        skillsRequired: ['Product Design', 'UI/UX', 'Figma', 'Prototyping', 'Design Systems', 'User Research'],
        status: 'published',
        applicationsCount: 1,
        viewsCount: 112,
      },
      {
        title: 'Backend Node.js & Distributed Systems Engineer',
        description: `Join InnovateLabs core backend squad building high-throughput payment settlement engines and fraud detection services. You will design event-driven services using Node.js, Redis, and message queues.`,
        employer: employer2._id,
        companyName: 'InnovateLabs',
        companyWebsite: 'https://innovate.co',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces',
        location: 'New York, NY (or Remote)',
        workplaceMode: 'remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salary: {
          min: 155000,
          max: 195000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: true,
        },
        requirements: [
          '5+ years backend engineering experience with Node.js and TypeScript',
          'Experience with transactional databases (PostgreSQL/MongoDB) and Redis caching layers',
          'Familiarity with event streaming platforms (Kafka, RabbitMQ, or AWS SQS)',
          'Understanding of financial compliance (PCI-DSS) and zero-trust security is a plus',
        ],
        responsibilities: [
          'Design and maintain fault-tolerant API microservices processing millions of daily transactions',
          'Build real-time fraud mitigation and automated reconciliation pipelines',
          'Optimize throughput, concurrency, and database connection pooling',
        ],
        skillsRequired: ['Node.js', 'Express.js', 'TypeScript', 'MongoDB', 'Redis', 'Kafka'],
        status: 'published',
        applicationsCount: 0,
        viewsCount: 78,
      },
      {
        title: 'Junior Mobile Application Developer (React Native)',
        description: `Exciting opportunity for an ambitious junior developer to help expand InnovateLabs mobile applications on iOS and Android. Gain hands-on mentorship from senior mobile architects!`,
        employer: employer2._id,
        companyName: 'InnovateLabs',
        companyWebsite: 'https://innovate.co',
        companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&h=128&fit=crop&crop=faces',
        location: 'New York, NY',
        workplaceMode: 'on-site',
        jobType: 'full-time',
        experienceLevel: 'entry',
        salary: {
          min: 75000,
          max: 95000,
          currency: 'USD',
          period: 'yearly',
          isNegotiable: false,
        },
        requirements: [
          '1-2 years experience or demonstrable portfolio projects with React Native or React',
          'Familiarity with mobile build tools (Xcode, Android Studio, Expo)',
          'Keen eye for smooth animations and responsive mobile layouts',
          'Passionate self-starter eager to learn modern mobile architecture',
        ],
        responsibilities: [
          'Build customer-facing mobile screens in React Native for iOS and Android',
          'Integrate RESTful endpoints and handle offline data persistence',
          'Debug cross-device rendering quirks and write unit tests',
        ],
        skillsRequired: ['React Native', 'JavaScript', 'Mobile App', 'Expo', 'Git'],
        status: 'published',
        applicationsCount: 0,
        viewsCount: 45,
      },
    ]);

    console.log(' Seeding Applications...');
    // Alex Chen applied to Senior Full Stack at TechCorp
    const app1 = await Application.create({
      job: jobs[0]._id,
      candidate: candidate1._id,
      employer: employer1._id,
      resume: resume1._id,
      resumeSnapshot: {
        originalName: resume1.originalName,
        filename: resume1.filename,
        filePath: resume1.filePath,
        mimeType: resume1.mimeType,
        fileSize: resume1.fileSize,
      },
      coverLetter: `Dear Hiring Team at TechCorp,\n\nI was thrilled to see your Senior Full Stack Engineer opening. With over 6 years building distributed MERN applications, optimizing MongoDB databases, and delivering clean TypeScript APIs, I am confident I can make an immediate impact on your engineering objectives.\n\nLooking forward to speaking with you!\n\nBest regards,\nAlex Chen`,
      status: 'shortlisted',
      employerNotes: 'Strong MERN and cloud profile. Excellent GitHub portfolio. Recommended for technical panel interview.',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: candidate1._id,
          note: 'Application submitted by candidate',
          changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'reviewing',
          changedBy: employer1._id,
          note: 'Profile matched core tech stack requirements',
          changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'shortlisted',
          changedBy: employer1._id,
          note: 'Passed initial recruiter screening. Shortlisted for technical round.',
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Elena Rostova applied to Senior Full Stack at TechCorp
    const app2 = await Application.create({
      job: jobs[0]._id,
      candidate: candidate2._id,
      employer: employer1._id,
      resume: resume2._id,
      resumeSnapshot: {
        originalName: resume2.originalName,
        filename: resume2.filename,
        filePath: resume2.filePath,
        mimeType: resume2.mimeType,
        fileSize: resume2.fileSize,
      },
      coverLetter: `Hi TechCorp Team,\n\nI am applying for the Senior Full Stack role. While my primary strength is modern React and frontend architecture, I have also developed Node.js backend services and would love to contribute across the stack!`,
      status: 'reviewing',
      employerNotes: 'Great frontend background, reviewing backend depth.',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: candidate2._id,
          note: 'Application submitted by candidate',
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'reviewing',
          changedBy: employer1._id,
          note: 'Reviewing application portfolio',
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Elena Rostova applied to Frontend React Developer at TechCorp
    const app3 = await Application.create({
      job: jobs[1]._id,
      candidate: candidate2._id,
      employer: employer1._id,
      resume: resume2._id,
      resumeSnapshot: {
        originalName: resume2.originalName,
        filename: resume2.filename,
        filePath: resume2.filePath,
        mimeType: resume2.mimeType,
        fileSize: resume2.fileSize,
      },
      coverLetter: `Hello Sarah,\n\nThis Frontend React Developer position matches my passion for design systems and performance optimization. I have spearheaded reusable component architectures and improved Core Web Vitals across multiple client projects.\n\nThank you for reviewing my profile!`,
      status: 'submitted',
      employerNotes: '',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: candidate2._id,
          note: 'Application submitted by candidate',
          changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ],
    });

    // Alex Chen applied to Lead Product Designer (demo status test)
    const app4 = await Application.create({
      job: jobs[3]._id,
      candidate: candidate1._id,
      employer: employer2._id,
      resume: resume1._id,
      resumeSnapshot: {
        originalName: resume1.originalName,
        filename: resume1.filename,
        filePath: resume1.filePath,
        mimeType: resume1.mimeType,
        fileSize: resume1.fileSize,
      },
      coverLetter: `Interested in contributing engineering perspective to design systems.`,
      status: 'rejected',
      employerNotes: 'Role requires 7+ years pure UX/product design leadership.',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: candidate1._id,
          note: 'Application submitted',
          changedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
          status: 'rejected',
          changedBy: employer2._id,
          note: 'Looking for candidate with dedicated design portfolio',
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    console.log(' Seeding Notifications...');
    await Notification.create([
      {
        recipient: employer1._id,
        sender: candidate1._id,
        type: 'application_received',
        title: 'New Candidate Application',
        message: 'Alex Chen applied for "Senior Full Stack Engineer (MERN / TypeScript)"',
        link: `/employer/jobs/${jobs[0]._id}/applicants`,
        relatedJob: jobs[0]._id,
        relatedApplication: app1._id,
        read: false,
      },
      {
        recipient: employer1._id,
        sender: candidate2._id,
        type: 'application_received',
        title: 'New Candidate Application',
        message: 'Elena Rostova applied for "Frontend React Developer"',
        link: `/employer/jobs/${jobs[1]._id}/applicants`,
        relatedJob: jobs[1]._id,
        relatedApplication: app3._id,
        read: true,
      },
      {
        recipient: candidate1._id,
        sender: employer1._id,
        type: 'status_changed',
        title: 'Application Shortlisted! 🎉',
        message: 'Your application for "Senior Full Stack Engineer" has been shortlisted by TechCorp Solutions.',
        link: '/candidate/applications',
        relatedJob: jobs[0]._id,
        relatedApplication: app1._id,
        read: false,
      },
      {
        recipient: candidate1._id,
        sender: employer2._id,
        type: 'status_changed',
        title: 'Application Status Updated: Declined',
        message: 'Your application for "Lead Product Designer" has been declined.',
        link: '/candidate/applications',
        relatedJob: jobs[3]._id,
        relatedApplication: app4._id,
        read: true,
      },
    ]);

    console.log('\n Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Test Accounts created:');
    console.log('  Admin:     admin@jobboard.com         / Password123!');
    console.log('  Employer:  employer@techcorp.io       / Password123!');
    console.log('  Employer:  talent@innovate.co         / Password123!');
    console.log('  Candidate: alex.chen@example.com      / Password123!');
    console.log('  Candidate: elena.dev@example.com      / Password123!');
    console.log('  Candidate: marcus.design@example.com  / Password123!');
    console.log('----------------------------------------------------\n');
  } catch (error) {
    console.error(' Seeding error:', error);
  }
};

// If run directly via `node src/utils/seedData.js`
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase().then(async () => {
    await closeDB();
    process.exit(0);
  });
}
