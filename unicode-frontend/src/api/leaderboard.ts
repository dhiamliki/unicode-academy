import { http } from "./http";

export type LeaderboardEntryDto = {
  rank: number;
  username: string;
  points: number;
  completedLessons: number;
  correctExercises: number;
};

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntryDto[]> {
  const res = await http.get<LeaderboardEntryDto[]>("/api/leaderboard", {
    params: { limit },
  });
  return res.data;
}

