import { supabase } from '@/lib/supabase';

// Static data for breeder meetings when Supabase is not available
export interface Meeting {
  id: string;
  name: string;
  location?: string;
  date?: string;
  description?: string;
  images: string[];
  created_at?: string;
}

export type CreateMeetingRequest = Omit<Meeting, 'id' | 'created_at'>;

const staticBreederMeetings: Meeting[] = [
  {
    id: 'geert-munnik',
    name: 'Geert Munnik',
    location: 'Holandia',
    date: '2024',
    description: 'Spotkanie z jednym z najlepszych hodowców gołębi pocztowych w Europie',
    images: [
      '/meetings-with-breeders/Geert Munnik/DSC_0031.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0038.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0044.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0399.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_0409.jpg',
      '/meetings-with-breeders/Geert Munnik/DSC_03991.jpg'
    ]
  },
  {
    id: 'jan-oost',
    name: 'Jan Oost',
    location: 'Belgia',
    date: '2024',
    description: 'Wizyta u mistrza hodowli gołębi belgijskich',
    images: [
      '/meetings-with-breeders/Jan Oost/DSC_0002.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0004.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0006.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0011.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0017.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0018.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0422.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0423.jpg',
      '/meetings-with-breeders/Jan Oost/DSC_0426.jpg'
    ]
  },
  {
    id: 'marginus-oostenbrink',
    name: 'Marginus Oostenbrink',
    location: 'Holandia',
    date: '2024',
    description: 'Spotkanie z holenderskim specjalistą od gołębi pocztowych',
    images: [
      '/meetings-with-breeders/Marginus Oostenbrink/DSC_0431.jpg',
      '/meetings-with-breeders/Marginus Oostenbrink/DSC_0433.jpg',
      '/meetings-with-breeders/Marginus Oostenbrink/DSC_0435.jpg'
    ]
  },
  {
    id: 'theo-lehnen',
    name: 'Theo Lehnen',
    location: 'Niemcy',
    date: '2024',
    description: 'Wizyta u niemieckiego hodowcy championów',
    images: [
      '/meetings-with-breeders/Theo Lehnen/Theo-1.jpg',
      '/meetings-with-breeders/Theo Lehnen/Theo-2.jpg',
      '/meetings-with-breeders/Theo Lehnen/Theo-3.jpg',
      '/meetings-with-breeders/Theo Lehnen/Theo.jpg'
    ]
  },
  {
    id: 'toni-van-ravenstein',
    name: 'Toni van Ravenstein',
    location: 'Holandia',
    date: '2024',
    description: 'Spotkanie z holenderską legendą hodowli gołębi',
    images: [
      '/meetings-with-breeders/Toni van Ravenstein/DSC_0001.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSC_0003.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSCF2556.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSCF2559.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/DSCF2578.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/TONI-1.jpg',
      '/meetings-with-breeders/Toni van Ravenstein/TONI-2.jpg'
    ]
  }
];

export const meetingsService = {
  getMeetings: async () => {
    try {
      // Check if supabase is initialized
      if (!supabase) {
        console.warn('Supabase client is not initialized, using static data');
        return staticBreederMeetings;
      }

      const { data, error } = await supabase
        .from('meetings')  // Changed from 'breeder_meetings'
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching breeder meetings:', error);
        console.log('Falling back to static data');
        return staticBreederMeetings;
      }

      // If Supabase returns data, use it; otherwise use static data
      return data && data.length > 0 ? data : staticBreederMeetings;
    } catch (error) {
      console.error('Error fetching breeder meetings:', error);
      console.log('Falling back to static data');
      return staticBreederMeetings;
    }
  },

  addMeeting: async (meetingData: {
    name: string;
    location?: string;
    date?: string;
    description?: string;
    images: string[];
  }) => {
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase
        .from('meetings')  // Changed from 'breeder_meetings'
        .insert([meetingData])
        .select();

      if (error) {
        throw error;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error adding breeder meeting:', error);
      throw error;
    }
  },
};