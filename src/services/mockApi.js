// src/services/mockApi.js

const INITIAL_USERS = [
  { id: 1, name: 'Super Admin', role: 'Admin', email: 'admin@crm.com', password: 'password123' },
  { id: 2, name: 'Sarah Team-Lead', role: 'Manager', email: 'sarah@crm.com', password: 'password123', teamId: 'A' },
  { id: 3, name: 'Mike Sales-Lead', role: 'Manager', email: 'mike@crm.com', password: 'password123', teamId: 'B' },
  { id: 4, name: 'John Sales-Exec', role: 'Executive', email: 'john@crm.com', password: 'password123', managerId: 2 },
  { id: 5, name: 'Emma Sales-Exec', role: 'Executive', email: 'emma@crm.com', password: 'password123', managerId: 2 },
  { id: 6, name: 'David Sales-Exec', role: 'Executive', email: 'david@crm.com', password: 'password123', managerId: 3 },
];

const MOCK_LEADS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'New', source: 'Facebook', assignedTo: 'Unassigned', date: 'Oct 24, 2023', executiveId: null },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Contacted', source: 'Website', assignedTo: 'John Sales-Exec', date: 'Oct 23, 2023', executiveId: 4 },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'Qualified', source: 'Referral', assignedTo: 'David Sales-Exec', date: 'Oct 22, 2023', executiveId: 6 },
  { id: 4, name: 'Emily Rodgers', email: 'emily@example.com', status: 'New', source: 'Facebook Lead', assignedTo: 'Emma Sales-Exec', date: 'Oct 25, 2023', executiveId: 5 },
  { id: 5, name: 'Marcus Chen', email: 'marcus@example.com', status: 'Pending', source: 'Website Inquiry', assignedTo: 'John Sales-Exec', date: 'Oct 25, 2023', executiveId: 4 },
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
  return saved ? JSON.parse(saved) : MOCK_LEADS;
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
      
      if (user.role === 'Admin') {
        return resolve(leads);
      }
      
      if (user.role === 'Manager') {
        const users = getMockUsers();
        const teamExecIds = users
          .filter(u => u.managerId === user.id)
          .map(u => u.id);
        
        return resolve(leads.filter(l => 
          teamExecIds.includes(l.executiveId) || l.executiveId === user.id || l.assignedTo === 'Unassigned'
        ));
      }
      
      if (user.role === 'Executive') {
        return resolve(leads.filter(l => l.executiveId === user.id));
      }
      
      resolve([]);
    }, 600);
  });
};

export const fetchStatsMock = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseStats = {
        totalLeads: 1284,
        conversions: 432,
        closedWon: 128,
        avgResponse: '2.4h',
        trends: { leads: '+12%', conversions: '+8%', closed: '+15%', response: '-10%' }
      };

      if (user?.role === 'Manager') {
        resolve({
          ...baseStats,
          totalLeads: 452,
          conversions: 156,
          closedWon: 42,
          avgResponse: '1.8h',
        });
      } else if (user?.role === 'Executive') {
        resolve({
          ...baseStats,
          totalLeads: 84,
          conversions: 24,
          closedWon: 8,
          avgResponse: '0.5h',
        });
      } else {
        resolve(baseStats);
      }
    }, 400);
  });
};

export const fetchTeamHierarchyMock = async (user) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = getMockUsers();
      const allManagers = users.filter(u => u.role === 'Manager');
      
      const hierarchy = allManagers.map(m => ({
        manager: m.name,
        managerId: m.id,
        members: users.filter(u => u.managerId === m.id).map(u => ({
          name: u.name,
          email: u.email,
          leads: Math.floor(Math.random() * 50) + 10 // Mock lead count
        }))
      }));

      // Add Direct Reports (Executives reporting to Admin/Owner)
      const directReports = users
        .filter(u => u.role === 'Executive' && (!u.managerId || u.managerId === 1))
        .map(u => ({
          name: u.name,
          email: u.email,
          leads: Math.floor(Math.random() * 50) + 5
        }));

      if (directReports.length > 0 && user?.role === 'Admin') {
        hierarchy.unshift({
          manager: 'Super Admin (Direct Reports)',
          managerId: 1,
          isOwnerTeam: true,
          members: directReports
        });
      }

      if (user?.role === 'Manager') {
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
        .filter(u => u.role === role)
        .map(u => {
          if (role === 'Executive') {
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
        .filter(u => u.role === 'Manager')
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
        leads[leadIndex] = {
          ...leads[leadIndex],
          executiveId: executive.id,
          assignedTo: executive.name,
          status: 'Contacted' // Automatically move to contacted on assignment
        };
        saveMockLeads(leads);
        resolve(leads[leadIndex]);
      } else {
        resolve(null);
      }
    }, 600);
  });
};
