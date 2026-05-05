import { create } from 'zustand';
import type { Job } from '@skillgap/types';

interface JobState {
  jobs: Job[];
  page: number;
  search: string;
  setJobs: (jobs: Job[]) => void;
}

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  page: 1,
  search: '',
  setJobs: (jobs) => set({ jobs }),
}));
