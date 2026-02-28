import { apiClient } from "./api";

// Static data for breeder meetings when API is not available
export interface Meeting {
  id: string;
  name: string;
  location?: string;
  date?: string;
  description?: string;
  images: string[];
  created_at?: string;
}

export type CreateMeetingRequest = Omit<Meeting, "id" | "created_at">;

const staticBreederMeetings: Meeting[] = [
  {
    id: "geert-munnik",
    name: "Geert Munnik",
    images: [
      "/meetings-with-breeders/Geert Munnik/DSC_0031.jpg",
      "/meetings-with-breeders/Geert Munnik/DSC_0038.jpg",
      "/meetings-with-breeders/Geert Munnik/DSC_0044.jpg",
      "/meetings-with-breeders/Geert Munnik/DSC_0399.jpg",
      "/meetings-with-breeders/Geert Munnik/DSC_0409.jpg",
      "/meetings-with-breeders/Geert Munnik/DSC_03991.jpg",
    ],
  },
  {
    id: "jan-oost",
    name: "Jan Oost",
    images: [
      "/meetings-with-breeders/Jan Oost/DSC_0002.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0004.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0006.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0011.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0017.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0018.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0422.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0423.jpg",
      "/meetings-with-breeders/Jan Oost/DSC_0426.jpg",
    ],
  },
  {
    id: "marginus-oostenbrink",
    name: "Marginus Oostenbrink",
    images: [
      "/meetings-with-breeders/Marginus Oostenbrink/DSC_0431.jpg",
      "/meetings-with-breeders/Marginus Oostenbrink/DSC_0433.jpg",
      "/meetings-with-breeders/Marginus Oostenbrink/DSC_0435.jpg",
    ],
  },
  {
    id: "theo-lehnen",
    name: "Theo Lehnen",
    images: [
      "/meetings-with-breeders/Theo Lehnen/Theo-1.jpg",
      "/meetings-with-breeders/Theo Lehnen/Theo-2.jpg",
      "/meetings-with-breeders/Theo Lehnen/Theo-3.jpg",
      "/meetings-with-breeders/Theo Lehnen/Theo.jpg",
    ],
  },
  {
    id: "toni-van-ravenstein",
    name: "Toni van Ravenstein",
    images: [
      "/meetings-with-breeders/Toni van Ravenstein/DSC_0001.jpg",
      "/meetings-with-breeders/Toni van Ravenstein/DSC_0003.jpg",
      "/meetings-with-breeders/Toni van Ravenstein/DSCF2556.jpg",
      "/meetings-with-breeders/Toni van Ravenstein/DSCF2559.jpg",
      "/meetings-with-breeders/Toni van Ravenstein/DSCF2578.jpg",
      "/meetings-with-breeders/Toni van Ravenstein/TONI-1.jpg",
      "/meetings-with-breeders/Toni van Ravenstein/TONI-2.jpg",
    ],
  },
];

export const meetingsService = {
  getMeetings: async () => {
    try {
      // Try fetching from our backend API instead of direct Supabase to avoid RLS/CORS issues in browsers
      const data = await apiClient.get<Meeting[]>("/breeder-meetings");

      if (data && Array.isArray(data) && data.length > 0) {
        // Merge API data with static data, prioritizing API data (newest first)
        // Filter out any static meetings that might be duplicated by ID in the API data
        const apiIds = new Set(data.map((m) => m.id));
        const uniqueStatic = staticBreederMeetings.filter(
          (m) => !apiIds.has(m.id),
        );
        return [...data, ...uniqueStatic];
      }

      // Fallback na statyczne jeśli API zwróciło pustą/niepoprawną odpowiedź
      return staticBreederMeetings;
    } catch (error) {
      console.error("Error fetching breeder meetings from API:", error);
      console.log("Falling back to static data");
      return staticBreederMeetings;
    }
  },

  addMeeting: async (meetingData: CreateMeetingRequest, token?: string) => {
    try {
      return await apiClient.post<Meeting>(
        "/breeder-meetings",
        meetingData,
        token,
      );
    } catch (error) {
      console.error("Error adding breeder meeting via API:", error);
      throw error;
    }
  },

  updateMeeting: async (
    meetingId: string,
    meetingData: Partial<CreateMeetingRequest> & {
      newImages?: File[];
      existingImages?: string[];
    },
    token?: string,
  ) => {
    try {
      const body =
        meetingData.newImages && meetingData.newImages.length > 0
          ? (() => {
              const fd = new FormData();
              fd.append(
                "data",
                JSON.stringify({
                  name: meetingData.name,
                  description: meetingData.description,
                  location: meetingData.location,
                  date: meetingData.date,
                  existingImages: meetingData.existingImages,
                }),
              );
              meetingData.newImages?.forEach((file) =>
                fd.append("images", file as Blob),
              );
              return fd;
            })()
          : meetingData;

      return await apiClient.patch<Meeting>(
        `/breeder-meetings/${meetingId}`,
        body as any,
        token,
      );
    } catch (error) {
      console.error("Error updating breeder meeting via API:", error);
      throw error;
    }
  },

  deleteMeeting: async (meetingId: string, token?: string) => {
    try {
      return await apiClient.delete(`/breeder-meetings/${meetingId}`, token);
    } catch (error) {
      console.error("Error deleting breeder meeting via API:", error);
      throw error;
    }
  },
};
