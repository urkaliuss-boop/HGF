import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock data for sandbox / local preview
const mockTasks = [
  {
    id: 1,
    category: 'Авито',
    remaining_count: 3,
    is_one_time: true,
    price: 150,
    title: 'Написать отзыв о покупке iPhone',
    description: 'Нужно написать честный отзыв на Авито. Аккаунт должен быть подтвержденным. Подробности в ТГ.',
    execution_time_hours: 24,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    category: 'Отзывы',
    remaining_count: 10,
    is_one_time: false,
    price: 200,
    title: 'Оставить отзыв на Яндекс Картах о ресторане',
    description: 'Перейдите на Яндекс Карты, найдите ресторан по названию и оставьте отзыв 5 звезд с фотографией.',
    execution_time_hours: 48,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    category: 'Приложения',
    remaining_count: 1,
    is_one_time: true,
    price: 50,
    title: 'Установить приложение "Мой Брокер" и поставить 5 звезд',
    description: 'Установите приложение из Google Play Store, попользуйтесь 2 минуты, поставьте оценку и напишите отзыв.',
    execution_time_hours: 12,
    created_at: new Date().toISOString()
  }
];

const mockSubmissions = [
  { user_id: 'user-1', status: 'approved', created_at: new Date(Date.now() - 2*24*3600*1000).toISOString() },
  { user_id: 'user-1', status: 'approved', created_at: new Date(Date.now() - 1*24*3600*1000).toISOString() },
  { user_id: 'user-2', status: 'approved', created_at: new Date(Date.now() - 3*24*3600*1000).toISOString() },
  { user_id: 'user-3', status: 'approved', created_at: new Date(Date.now() - 4*24*3600*1000).toISOString() }
];

const mockProfiles = [
  { id: 'user-1', email: 'alex_worker@gmail.com', role: 'user' },
  { id: 'user-2', email: 'dmitry_cool@mail.ru', role: 'user' },
  { id: 'user-3', email: 'elena_work@yandex.ru', role: 'user' },
  { id: 'user-admin', email: 'admin@noxiss.work', role: 'admin' }
];

class MockBuilder {
  private table: string;
  private keyFilter: string | null = null;
  constructor(table: string) {
    this.table = table;
  }
  select() { return this; }
  eq(col: string, val: any) {
    if (col === 'key') {
      this.keyFilter = val;
    }
    return this;
  }
  gt() { return this; }
  lt() { return this; }
  in() { return this; }
  neq() { return this; }
  order() { return this; }
  gte() { return this; }
  limit() { return this; }
  single() {
    let data: any = null;
    if (this.table === 'app_settings') {
      if (this.keyFilter === 'maintenance_mode') {
        data = { value: 'false' };
      } else if (this.keyFilter === 'stats_config') {
        data = { value: JSON.stringify({ mode: 'fake', online: 342, paid: 89450, reviews: 1428, daily: 1450 }) };
      } else {
        data = { value: 'false' };
      }
    } else if (this.table === 'settings') {
      data = { leaderboard_week_start: new Date(Date.now() - 5*24*3600*1000).toISOString() };
    }
    return Promise.resolve({ data, error: null });
  }
  // Make MockBuilder acts as a promise for select()... then()
  then(resolve: any) {
    let data: any = null;
    if (this.table === 'tasks') {
      data = mockTasks;
    } else if (this.table === 'task_submissions') {
      data = mockSubmissions;
    } else if (this.table === 'profiles') {
      // Filter out admin since Leaderboard.tsx filters in JS or DB
      data = mockProfiles;
    }
    resolve({ data, error: null });
    return Promise.resolve({ data, error: null });
  }
}

const createMockSupabase = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUser: async () => ({ data: { user: null } }),
      signUp: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null })
    },
    from: (table: string) => {
      return new MockBuilder(table);
    },
    rpc: async (fnName: string) => {
      if (fnName === 'get_real_stats') {
        return { data: { online: 342, paid: 89450, reviews: 1428, daily: 1450 }, error: null };
      }
      return { data: null, error: null };
    },
    channel: () => {
      const channelObj = {
        on: () => channelObj,
        subscribe: () => channelObj
      };
      return channelObj;
    },
    removeChannel: () => {}
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMockSupabase() as any);


