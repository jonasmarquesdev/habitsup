export interface Habit {
    created_at: Date;
    id: string;
    title: string;
    userId: string;
    weekDays: {
        habit_id: string;
        id: string;
        week_day: number;
    }[];
}