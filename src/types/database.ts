export type MovieInteractionAction = 'LIKE' | 'MAYBE' | 'DISCARD';

export interface Database {
  public: {
    Tables: {
      movies: {
        Row: {
          id: number;
          title: string;
          overview: string | null;
          poster_path: string | null;
          release_date: string | null;
          vote_average: number | null;
          created_at: string;
        };
        Insert: {
          id: number;
          title: string;
          overview?: string | null;
          poster_path?: string | null;
          release_date?: string | null;
          vote_average?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          overview?: string | null;
          poster_path?: string | null;
          release_date?: string | null;
          vote_average?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          invited_email: string;
          invited_user_id: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          invited_email: string;
          invited_user_id?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          invited_email?: string;
          invited_user_id?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Relationships: [];
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string | null;
          movie_id: number;
          room_id: string | null;
          action: MovieInteractionAction;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          movie_id: number;
          room_id?: string | null;
          action: MovieInteractionAction;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          movie_id?: number;
          room_id?: string | null;
          action?: MovieInteractionAction;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_interactions_movie_id_fkey";
            columns: ["movie_id"];
            isOneToOne: false;
            referencedRelation: "movies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_interactions_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      action_type: MovieInteractionAction;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

