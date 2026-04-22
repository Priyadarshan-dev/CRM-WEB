// src/services/mockApi.js
import { pushNotification } from '../context/NotificationContext';

const INITIAL_USERS = [
  { id: 1, name: 'Super Admin', role: 'ADMIN', email: 'admin@crm.com', password: 'password123' },
  { id: 2, name: 'Sarah Team-Lead', role: 'MANAGER', email: 'sarah@crm.com', password: 'password123', teamId: 'A' },
  { id: 3, name: 'Mike Sales-Lead', role: 'MANAGER', email: 'mike@crm.com', password: 'password123', teamId: 'B' },
  { id: 4, name: 'John Sales-Exec', role: 'EXECUTIVE', email: 'john@crm.com', password: 'password123', managerId: 2 },
  { id: 5, name: 'Emma Sales-Exec', role: 'EXECUTIVE', email: 'emma@crm.com', password: 'password123', managerId: 2 },
  { id: 6, name: 'David Sales-Exec', role: 'EXECUTIVE', email: 'david@crm.com', password: 'password123', managerId: 3 },
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 10,
    name: `Exec ${i + 1}`,
    role: 'EXECUTIVE',
    email: `exec${i + 1}@crm.com`,
    password: 'password123',
    managerId: 2 
  }))
];

const MOCK_LEADS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'New', source: 'Facebook', assignedTo: 'Unassigned', date: 'Oct 24, 2023', executiveId: null },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 987-6543', status: 'Contacted', source: 'Website', assignedTo: 'John Sales-Exec', date: 'Oct 23, 2023', executiveId: 4 },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 456-7890', status: 'Qualified', source: 'Referral', assignedTo: 'David Sales-Exec', date: 'Oct 22, 2023', executiveId: 6 },
  { id: 4, name: 'Emily Rodgers', email: 'emily@example.com', phone: '+1 (555) 321-0987', status: 'New', source: 'Facebook Lead', assignedTo: 'Emma Sales-Exec', date: 'Oct 25, 2023', executiveId: 5 },
  { id: 5, name: 'Marcus Chen', email: 'marcus@example.com', phone: '+1 (555) 654-3210', status: 'Pending', source: 'Website Inquiry', assignedTo: 'John Sales-Exec', date: 'Oct 25, 2023', executiveId: 4 },
  ...Array.from({ length: 25 }, (_, i) => ({
    id: i + 6,
    name: `Assigned Lead ${i + 1}`,
    email: `lead${i+1}@example.com`,
    phone: `+1 (555) 111-${String(i).padStart(4, '0')}`,
    status: ['New', 'Contacted', 'Pending'][i % 3],
    source: 'Website',
    assignedTo: 'John Sales-Exec',
    date: 'Oct 26, 2023',
    executiveId: 4
  })),
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 100,
    name: `Unassigned Lead ${i + 1}`,
    email: `unassigned${i+1}@example.com`,
    phone: `+1 (555) 222-${String(i).padStart(4, '0')}`,
    status: 'New',
    source: i % 2 === 0 ? 'Facebook' : 'Website',
    assignedTo: 'Unassigned',
    date: 'Oct 27, 2023',
    executiveId: null
  }))
];

// Helper to manage users and leads in localStorage for persistence during demo
const getMockUsers = () => {
  const saved = localStorage.getItem('crm_mock_users');
  return saved ? JSON.parse(saved) : INITIAL_USERS;
};

const saveMockUsers = (users) => {
  localStorage.setItem('crm_mock_users', JSON.stringify(users));
};

const getMockLeads = () => {
  const saved = localStorage.getItem('crm_mock_leads');
  const leads = saved ? JSON.parse(saved) : MOCK_LEADS;
  if (leads.length < 25) {
    localStorage.setItem('crm_mock_leads', JSON.stringify(MOCK_LEADS));
    return MOCK_LEADS;
  }
  return leads;
};

const saveMockLeads = (leads) => {
  localStorage.setItem('crm_mock_leads', JSON.stringify(leads));
};

export const loginMock = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 800);
  });
};

export const createUserMock = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getMockUsers();
      const newUser = {
        id: users.length + 1,
        password: 'password123', // Default fallback
        ...userData,
      };
      saveMockUsers([...users, newUser]);

      // ─── Notifications ────────────────────────────────────────
      // Notify the newly created user
      pushNotification({
        recipientId: newUser.id,
        type: 'user_created',
        title: 'Welcome to LeadCRM!',
        message: `You've been added as a ${newUser.role}. Login with your credentials to get started.`,
      });

      // If an Executive was created under a Manager, notify that Manager
      if (newUser.role === 'Executive' && newUser.managerId) {
        pushNotification({
          recipientId: newUser.managerId,
          type: 'user_created',
          title: 'New Team Member',
          message: `${newUser.name} has been added to your team as an Executive.`,
        });
      }

      // If a Manager was created, notify the Admin (id: 1)
      if (newUser.role === 'Manager') {
        pushNotification({
          recipientId: 1,
          type: 'user_created',
          title: 'New Manager Onboarded',
          message: `${newUser.name} has been added as a Manager and is ready to go.`,
        });
      }
      // ──────────────────────────────────────────────────────────

      resolve(newUser);
    }, 600);
  });
};

export const createLeadMock = async (leadData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leads = getMockLeads();
      const newLead = {
        id: leads.length + 1,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        assignedTo: 'Unassigned',
        executiveId: null,
        ...leadData,
      };
      saveMockLeads([newLead, ...leads]);
      resolve(newLead);
    }, 600);
  });
};

export const fetchLeadsMock = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!user) return resolve([]);
      const leads = getMockLeads();
      
      const role = user.role?.toUpperCase();
      if (role === 'ADMIN') {
        return resolve(leads);
      }
      
      if (role === 'MANAGER') {
        const users = getMockUsers();
        const teamExecIds = users
          .filter(u => u.managerId === user.id)
          .map(u => u.id);
        
        return resolve(leads.filter(l => 
          teamExecIds.includes(l.executiveId) || 
          l.executiveId === user.id || 
          l.managerId === user.id ||
          (l.assignedTo === 'Unassigned' && !l.managerId)
        ));
      }
      
      if (role === 'EXECUTIVE') {
        return resolve(leads.filter(l => l.executiveId === user.id));
      }
      
      resolve([]);
    }, 600);
  });
};

export const fetchStatsMock = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!user) return resolve({});
      
      const leads = getMockLeads();
      const users = getMockUsers();
      
      let filteredLeads = [];
      const role = user.role?.toUpperCase();
      
      if (role === 'ADMIN') {
        filteredLeads = leads;
      } else if (role === 'MANAGER') {
        const teamExecIds = users
          .filter(u => u.managerId === user.id)
          .map(u => u.id);
        
        filteredLeads = leads.filter(l => 
          teamExecIds.includes(l.executiveId) || 
          l.executiveId === user.id || 
          l.managerId === user.id
        );
      } else if (role === 'EXECUTIVE') {
        filteredLeads = leads.filter(l => l.executiveId === user.id);
      }

      const totalLeads = filteredLeads.length;
      const conversions = filteredLeads.filter(l => l.status === 'Qualified').length;
      const pendingTasks = filteredLeads.filter(l => l.status === 'New' || l.status === 'Pending').length;
      const rate = totalLeads > 0 ? ((conversions / totalLeads) * 100).toFixed(1) : 0;

      // Calculate daily performance for the last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      }

      const dailyStats = days.map(day => {
        const dayLeads = filteredLeads.filter(l => l.date === day);
        return {
          day: day.split(',')[0], // e.g., "Oct 24"
          total: dayLeads.length,
          converted: dayLeads.filter(l => l.status === 'Qualified').length
        };
      });

      // Calculate lead source distribution
      const sourceCounts = filteredLeads.reduce((acc, l) => {
        const source = l.source || 'Other';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const leadSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source,
          percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      resolve({
        totalLeads,
        conversions,
        pendingTasks,
        conversionRate: `${rate}%`,
        dailyStats,
        leadSources,
        trends: { leads: '+12%', conversions: '+8%', tasks: '-5%', rate: '+3%' }
      });
    }, 400);
  });
};

export const fetchTeamHierarchyMock = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leads = getMockLeads();
      const users = getMockUsers();
      const allManagers = users.filter(u => u.role === 'Manager');
      
      const hierarchy = allManagers.map(m => ({
        manager: m.name,
        managerId: m.id,
        members: users.filter(u => u.managerId === m.id).map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          leads: leads.filter(l => l.executiveId === u.id).length
        }))
      }));

      // Add Direct Reports (Executives reporting to Admin/Owner)
      const directReports = users
        .filter(u => u.role === 'Executive' && (!u.managerId || u.managerId === 1))
        .map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          leads: leads.filter(l => l.executiveId === u.id).length
        }));

      const role = user?.role?.toUpperCase();
      if (directReports.length > 0 && role === 'ADMIN') {
        hierarchy.unshift({
          manager: 'Super Admin (Direct Reports)',
          managerId: 1,
          isOwnerTeam: true,
          members: directReports
        });
      }

      if (role === 'MANAGER') {
        resolve(hierarchy.filter(t => t.managerId === user.id));
      } else {
        resolve(hierarchy);
      }
    }, 500);
  });
};
export const fetchUsersByRoleMock = async (role) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getMockUsers();
      const filtered = users
        .filter(u => u.role?.toUpperCase() === role?.toUpperCase())
        .map(u => {
          if (role?.toUpperCase() === 'EXECUTIVE') {
            const manager = users.find(m => m.id === u.managerId);
            return { ...u, managerName: manager ? manager.name : 'Direct Report' };
          }
          return u;
        });
      resolve(filtered);
    }, 500);
  });
};

export const fetchManagersShortMock = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getMockUsers();
      const managers = users
        .filter(u => u.role?.toUpperCase() === 'MANAGER')
        .map(u => ({ id: u.id, name: u.name }));
      resolve(managers);
    }, 400);
  });
};
export const updateLeadAssignmentMock = async (leadId, executiveId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leads = getMockLeads();
      const users = getMockUsers();
      
      const executive = users.find(u => u.id === parseInt(executiveId));
      const leadIndex = leads.findIndex(l => l.id === parseInt(leadId));
      
      if (leadIndex !== -1 && executive) {
        const lead = leads[leadIndex];
        leads[leadIndex] = {
          ...lead,
          executiveId: executive.id,
          assignedTo: executive.name,
          status: 'Contacted' // Automatically move to contacted on assignment
        };
        saveMockLeads(leads);

        // ─── Notification: tell the Executive ──────────────────
        pushNotification({
          recipientId: executive.id,
          type: 'lead_assigned',
          title: 'New Lead Assigned',
          message: `"${lead.name}" has been assigned to you. Check your Tasks page to follow up.`,
        });
        // ───────────────────────────────────────────────────────

        resolve(leads[leadIndex]);
      } else {
        resolve(null);
      }
    }, 600);
  });
};

// Helper: find a value from a CSV row by trying multiple possible column name spellings
const normalizeKey = (obj, keys) => {
  const lc = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.trim().toLowerCase(), typeof v === 'string' ? v.trim() : v])
  );
  for (const k of keys) {
    if (lc[k] !== undefined && lc[k] !== '') return lc[k];
  }
  return '';
};

export const bulkCreateLeadsMock = async (leadsArray) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existing = getMockLeads();
      const today = new Date().toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });

      const newLeads = leadsArray.map((row, i) => ({
        id: existing.length + i + 1,
        name:   normalizeKey(row, ['name', 'full name', 'fullname', 'lead name']) || `Lead ${existing.length + i + 1}`,
        email:  normalizeKey(row, ['email', 'email address', 'e-mail']),
        phone:  normalizeKey(row, ['phone', 'phone number', 'mobile', 'contact']) || 'N/A',
        source: normalizeKey(row, ['source', 'lead source', 'channel']) || 'CSV Import',
        status: normalizeKey(row, ['status', 'lead status']) || 'New',
        assignedTo: 'Unassigned',
        executiveId: null,
        date: today,
      }));

      saveMockLeads([...newLeads, ...existing]);
      resolve(newLeads);
    }, 800);
  });
};
export const updateLeadMock = async (id, leadData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leads = getMockLeads();
      const index = leads.findIndex(l => l.id === parseInt(id));
      if (index !== -1) {
        leads[index] = { ...leads[index], ...leadData };
        saveMockLeads(leads);
        resolve(leads[index]);
      } else {
        resolve(null);
      }
    }, 600);
  });
};

export const deleteLeadMock = async (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const leads = getMockLeads();
      const filtered = leads.filter(l => l.id !== parseInt(id));
      saveMockLeads(filtered);
      resolve(true);
    }, 600);
  });
};

export const fetchSquadMembersMock = async (managerId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getMockUsers();
      const squad = users
        .filter(u => u.managerId === parseInt(managerId) && u.role?.toUpperCase() === 'EXECUTIVE')
        .map(u => {
          const leads = getMockLeads();
          const assignedLeads = leads.filter(l => l.executiveId === u.id).length;
          return { ...u, leadsCount: assignedLeads, managerName: users.find(m => m.id === parseInt(managerId))?.name };
        });
      resolve(squad);
    }, 500);
  });
};

export const fetchUserByIdMock = async (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getMockUsers();
      const user = users.find(u => u.id === parseInt(userId));
      resolve(user || null);
    }, 400);
  });
};
