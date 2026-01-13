import { User } from '@/lib/types/user.types';
import { Category } from '@/lib/types/category.types';
import { Prompt } from '@/lib/types/prompt.types';
import { UserGeneration } from '@/lib/types/user-generation.types';

/**
 * Process user login data for charts
 */
export function processUserLoginData(users: User[]) {
  const now = new Date();
  
  // Day-wise data (last 30 days)
  const dayWise = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Count new users (created on this date)
    const newUsersOnDate = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = user.createdAt.toDate();
      return createdDate.toDateString() === date.toDateString();
    }).length;
    
    // Count active users (logged in on this date)
    const activeUsersOnDate = users.filter(user => {
      if (!user.lastLogin) return false;
      const loginDate = user.lastLogin.toDate();
      return loginDate.toDateString() === date.toDateString();
    }).length;
    
    dayWise.push({ 
      date: dateStr, 
      newUsers: newUsersOnDate,
      activeUsers: activeUsersOnDate
    });
  }
  
  // Month-wise data (last 12 months)
  const monthWise = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    // Count new users in this month
    const newUsersInMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = user.createdAt.toDate();
      return createdDate.getMonth() === date.getMonth() && 
             createdDate.getFullYear() === date.getFullYear();
    }).length;
    
    // Count active users in this month
    const activeUsersInMonth = users.filter(user => {
      if (!user.lastLogin) return false;
      const loginDate = user.lastLogin.toDate();
      return loginDate.getMonth() === date.getMonth() && 
             loginDate.getFullYear() === date.getFullYear();
    }).length;
    
    monthWise.push({ 
      month: monthStr, 
      newUsers: newUsersInMonth,
      activeUsers: activeUsersInMonth
    });
  }
  
  // Year-wise data (last 5 years)
  const yearWise = [];
  for (let i = 4; i >= 0; i--) {
    const year = now.getFullYear() - i;
    
    // Count new users in this year
    const newUsersInYear = users.filter(user => {
      if (!user.createdAt) return false;
      const createdDate = user.createdAt.toDate();
      return createdDate.getFullYear() === year;
    }).length;
    
    // Count active users in this year
    const activeUsersInYear = users.filter(user => {
      if (!user.lastLogin) return false;
      const loginDate = user.lastLogin.toDate();
      return loginDate.getFullYear() === year;
    }).length;
    
    yearWise.push({ 
      year: year.toString(), 
      newUsers: newUsersInYear,
      activeUsers: activeUsersInYear
    });
  }
  
  return { dayWise, monthWise, yearWise };
}

/**
 * Process category search data for charts
 */
export function processCategorySearchData(categories: Category[]) {
  return categories
    .map(cat => ({
      name: cat.name,
      searches: Number(cat.searchCount) || 0,
      color: '#FF6B35'
    }))
    .filter(cat => cat.searches > 0);
}

/**
 * Process prompts analytics data for charts
 */
export function processPromptsAnalyticsData(prompts: Prompt[]) {
  // Get top 10 prompts by total engagement (likes + searches + saves)
  const topPrompts = prompts
    .map(prompt => ({
      name: prompt.title.length > 20 ? prompt.title.substring(0, 20) + '...' : prompt.title,
      likes: prompt.likesCount || 0,
      searches: prompt.searchCount || 0,
      saves: prompt.savesCount || 0,
      total: (prompt.likesCount || 0) + (prompt.searchCount || 0) + (prompt.savesCount || 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
  
  // Overview data
  const overview = {
    total: prompts.length,
    trending: prompts.filter(p => p.isTrending).length,
    regular: prompts.filter(p => !p.isTrending).length
  };
  
  return { topPrompts, overview };
}

/**
 * Process generation data for charts
 */
export function processGenerationData(generations: UserGeneration[]) {
  const now = new Date();

  // Day-wise data (last 30 days)
  const dayWise = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayGenerations = generations.filter(gen => {
      if (!gen.createdAt) return false;
      const genDate = gen.createdAt.toDate ? gen.createdAt.toDate() : new Date(gen.createdAt as any);
      return genDate.toISOString().split('T')[0] === dateStr;
    });

    const success = dayGenerations.filter(g => g.generationStatus === 'success').length;
    const failed = dayGenerations.filter(g => g.generationStatus === 'failed').length;
    const pending = dayGenerations.filter(g => g.generationStatus === 'pending').length;
    const total = dayGenerations.length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    dayWise.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      success,
      failed,
      pending,
      total,
      successRate,
    });
  }

  // Month-wise data (last 12 months)
  const monthWise = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const monthGenerations = generations.filter(gen => {
      if (!gen.createdAt) return false;
      const genDate = gen.createdAt.toDate ? gen.createdAt.toDate() : new Date(gen.createdAt as any);
      return genDate.getFullYear() === year && genDate.getMonth() === month;
    });

    const success = monthGenerations.filter(g => g.generationStatus === 'success').length;
    const failed = monthGenerations.filter(g => g.generationStatus === 'failed').length;
    const pending = monthGenerations.filter(g => g.generationStatus === 'pending').length;
    const total = monthGenerations.length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    monthWise.push({
      month: monthNames[month],
      success,
      failed,
      pending,
      total,
      successRate,
    });
  }

  // Year-wise data (last 5 years)
  const yearWise = [];
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now);
    date.setFullYear(date.getFullYear() - i);
    const year = date.getFullYear();
    
    const yearGenerations = generations.filter(gen => {
      if (!gen.createdAt) return false;
      const genDate = gen.createdAt.toDate ? gen.createdAt.toDate() : new Date(gen.createdAt as any);
      return genDate.getFullYear() === year;
    });

    const success = yearGenerations.filter(g => g.generationStatus === 'success').length;
    const failed = yearGenerations.filter(g => g.generationStatus === 'failed').length;
    const pending = yearGenerations.filter(g => g.generationStatus === 'pending').length;
    const total = yearGenerations.length;
    const successRate = total > 0 ? Math.round((success / total) * 100) : 0;

    yearWise.push({
      year: year.toString(),
      success,
      failed,
      pending,
      total,
      successRate,
    });
  }

  return { dayWise, monthWise, yearWise };
}
