
/**
 * ABB Procurement CRM - Backend Data Storage Module
 * Handles all data persistence, validation, and operations
 */

class ABBProcurementDataStore {
  constructor(storageKey = 'abbProcCRM_v4') {
    this.storageKey = storageKey;
    this.data = this.initializeData();
    this.nextId = this.data.nextId || { p: 1, s: 1, r: 1, o: 1, b: 1, bi: 1, pp: 1, c: 1, rm: 1 };
  }

  // Initialize data structure
  initializeData() {
    const stored = localStorage.getItem(this.storageKey);
    const defaultData = {
      projects: [],
      suppliers: [],
      rfqs: [],
      orders: [],
      boms: [],
      procplans: [],
      contracts: [],
      reminders: [],
      activity: [],
      settings: { email: '', cc: '', pubkey: '', service: '', template: '', threshold: 0 }
    };

    if (stored) {
      try {
        return { ...defaultData, ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        return defaultData;
      }
    }
    return defaultData;
  }

  // Save all data to localStorage
  save() {
    this.data.nextId = this.nextId;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      return { success: true, message: 'Data saved successfully' };
    } catch (e) {
      console.error('Error saving data:', e);
      return { success: false, error: e.message };
    }
  }

  // Export data to JSON file
  exportToJSON() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ABB_Procurement_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import data from JSON file
  importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          this.data = { ...this.data, ...imported };
          this.nextId = imported.nextId || this.nextId;
          this.save();
          resolve({ success: true, message: 'Data imported successfully' });
        } catch (error) {
          reject({ success: false, error: error.message });
        }
      };
      reader.onerror = () => reject({ success: false, error: 'File read error' });
      reader.readAsText(file);
    });
  }

  // Clear all data
  clearAllData() {
    if (confirm('⚠️ This will delete ALL data. This cannot be undone. Are you sure?')) {
      this.data = this.initializeData();
      this.nextId = { p: 1, s: 1, r: 1, o: 1, b: 1, bi: 1, pp: 1, c: 1, rm: 1 };
      localStorage.removeItem(this.storageKey);
      return { success: true, message: 'All data cleared' };
    }
    return { success: false, message: 'Clear cancelled' };
  }

  // ═══ PROJECTS ═══
  addProject(project) {
    const newProject = {
      id: 'P' + String(this.nextId.p++).padStart(3, '0'),
      ...project,
      createdAt: new Date().toISOString()
    };
    this.data.projects.push(newProject);
    this.save();
    return newProject;
  }

  updateProject(id, updates) {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.projects[idx] = { ...this.data.projects[idx], ...updates };
      this.save();
      return this.data.projects[idx];
    }
    return null;
  }

  deleteProject(id) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    this.save();
  }

  getProject(id) {
    return this.data.projects.find(p => p.id === id);
  }

  getAllProjects() {
    return this.data.projects;
  }

  // ═══ SUPPLIERS ═══
  addSupplier(supplier) {
    const newSupplier = {
      id: 'S' + String(this.nextId.s++).padStart(3, '0'),
      ...supplier,
      createdAt: new Date().toISOString()
    };
    this.data.suppliers.push(newSupplier);
    this.save();
    return newSupplier;
  }

  updateSupplier(id, updates) {
    const idx = this.data.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.suppliers[idx] = { ...this.data.suppliers[idx], ...updates };
      this.save();
      return this.data.suppliers[idx];
    }
    return null;
  }

  deleteSupplier(id) {
    this.data.suppliers = this.data.suppliers.filter(s => s.id !== id);
    this.save();
  }

  getSupplier(id) {
    return this.data.suppliers.find(s => s.id === id);
  }

  getAllSuppliers() {
    return this.data.suppliers;
  }

  // ═══ PURCHASE ORDERS ═══
  addOrder(order) {
    const newOrder = {
      id: 'PO' + String(this.nextId.o++).padStart(4, '0'),
      ...order,
      createdAt: new Date().toISOString()
    };
    this.data.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  updateOrder(id, updates) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }

  deleteOrder(id) {
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    this.save();
  }

  getOrder(id) {
    return this.data.orders.find(o => o.id === id);
  }

  getOrdersByProject(projectId) {
    return this.data.orders.filter(o => o.project === projectId);
  }

  getOrdersBySupplier(supplierId) {
    return this.data.orders.filter(o => o.supplier === supplierId);
  }

  getAllOrders() {
    return this.data.orders;
  }

  // ═══ BOMs ═══
  addBOM(bom) {
    const newBOM = {
      id: 'B' + String(this.nextId.b++).padStart(3, '0'),
      items: [],
      ...bom,
      createdAt: new Date().toISOString()
    };
    this.data.boms.push(newBOM);
    this.save();
    return newBOM;
  }

  updateBOM(id, updates) {
    const idx = this.data.boms.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.boms[idx] = { ...this.data.boms[idx], ...updates };
      this.save();
      return this.data.boms[idx];
    }
    return null;
  }

  deleteBOM(id) {
    this.data.boms = this.data.boms.filter(b => b.id !== id);
    this.save();
  }

  getBOM(id) {
    return this.data.boms.find(b => b.id === id);
  }

  addBOMItem(bomId, item) {
    const bom = this.getBOM(bomId);
    if (bom) {
      const newItem = {
        id: 'BI' + String(this.nextId.bi++).padStart(4, '0'),
        ...item
      };
      if (!bom.items) bom.items = [];
      bom.items.push(newItem);
      this.save();
      return newItem;
    }
    return null;
  }

  updateBOMItem(bomId, itemId, updates) {
    const bom = this.getBOM(bomId);
    if (bom && bom.items) {
      const idx = bom.items.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        bom.items[idx] = { ...bom.items[idx], ...updates };
        this.save();
        return bom.items[idx];
      }
    }
    return null;
  }

  deleteBOMItem(bomId, itemId) {
    const bom = this.getBOM(bomId);
    if (bom && bom.items) {
      bom.items = bom.items.filter(i => i.id !== itemId);
      this.save();
    }
  }

  getAllBOMs() {
    return this.data.boms;
  }

  // ═══ PROCUREMENT PLANS ═══
  addProcPlan(plan) {
    const newPlan = {
      id: 'PP' + String(this.nextId.pp++).padStart(3, '0'),
      ...plan,
      createdAt: new Date().toISOString()
    };
    this.data.procplans.push(newPlan);
    this.save();
    return newPlan;
  }

  updateProcPlan(id, updates) {
    const idx = this.data.procplans.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.procplans[idx] = { ...this.data.procplans[idx], ...updates };
      this.save();
      return this.data.procplans[idx];
    }
    return null;
  }

  deleteProcPlan(id) {
    this.data.procplans = this.data.procplans.filter(p => p.id !== id);
    this.save();
  }

  getProcPlan(id) {
    return this.data.procplans.find(p => p.id === id);
  }

  getAllProcPlans() {
    return this.data.procplans;
  }

  // ═══ RFQs ═══
  addRFQ(rfq) {
    const newRFQ = {
      id: 'RFQ' + String(this.nextId.r++).padStart(4, '0'),
      ...rfq,
      createdAt: new Date().toISOString()
    };
    this.data.rfqs.push(newRFQ);
    this.save();
    return newRFQ;
  }

  updateRFQ(id, updates) {
    const idx = this.data.rfqs.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.rfqs[idx] = { ...this.data.rfqs[idx], ...updates };
      this.save();
      return this.data.rfqs[idx];
    }
    return null;
  }

  deleteRFQ(id) {
    this.data.rfqs = this.data.rfqs.filter(r => r.id !== id);
    this.save();
  }

  getRFQ(id) {
    return this.data.rfqs.find(r => r.id === id);
  }

  getAllRFQs() {
    return this.data.rfqs;
  }

  // ═══ CONTRACTS ═══
  addContract(contract) {
    const newContract = {
      id: 'C' + String(this.nextId.c++).padStart(3, '0'),
      ...contract,
      createdAt: new Date().toISOString()
    };
    this.data.contracts.push(newContract);
    this.save();
    return newContract;
  }

  updateContract(id, updates) {
    const idx = this.data.contracts.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.contracts[idx] = { ...this.data.contracts[idx], ...updates };
      this.save();
      return this.data.contracts[idx];
    }
    return null;
  }

  deleteContract(id) {
    this.data.contracts = this.data.contracts.filter(c => c.id !== id);
    this.save();
  }

  getContract(id) {
    return this.data.contracts.find(c => c.id === id);
  }

  getAllContracts() {
    return this.data.contracts;
  }

  // ═══ REMINDERS ═══
  addReminder(reminder) {
    const newReminder = {
      id: 'R' + String(this.nextId.rm++).padStart(3, '0'),
      done: false,
      ...reminder,
      createdAt: new Date().toISOString()
    };
    this.data.reminders.push(newReminder);
    this.save();
    return newReminder;
  }

  updateReminder(id, updates) {
    const idx = this.data.reminders.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.reminders[idx] = { ...this.data.reminders[idx], ...updates };
      this.save();
      return this.data.reminders[idx];
    }
    return null;
  }

  deleteReminder(id) {
    this.data.reminders = this.data.reminders.filter(r => r.id !== id);
    this.save();
  }

  getReminder(id) {
    return this.data.reminders.find(r => r.id === id);
  }

  getActiveReminders() {
    return this.data.reminders.filter(r => !r.done);
  }

  getAllReminders() {
    return this.data.reminders;
  }

  // ═══ ACTIVITY LOG ═══
  logActivity(message, color = '#6764f6') {
    this.data.activity.unshift({
      msg: message,
      color: color,
      time: new Date().toLocaleString()
    });
    // Keep only last 200 entries
    if (this.data.activity.length > 200) {
      this.data.activity.pop();
    }
    this.save();
  }

  getActivityLog() {
    return this.data.activity;
  }

  // ═══ ANALYTICS ═══
  getStats() {
    return {
      totalProjects: this.data.projects.length,
      totalSuppliers: this.data.suppliers.length,
      totalPOs: this.data.orders.length,
      totalBOMs: this.data.boms.length,
      totalProcPlans: this.data.procplans.length,
      totalRFQs: this.data.rfqs.length,
      totalContracts: this.data.contracts.length,
      pendingPOs: this.data.orders.filter(o => ['Draft', 'Approved', 'Sent', 'Acknowledged'].includes(o.status)).length,
      poValue: this.data.orders.reduce((sum, o) => sum + (o.amount || 0), 0),
      activeReminders: this.data.reminders.filter(r => !r.done).length
    };
  }

  // ═══ SEARCH ═══
  search(query, types = ['projects', 'suppliers', 'orders']) {
    const q = query.toLowerCase();
    const results = {};

    if (types.includes('projects')) {
      results.projects = this.data.projects.filter(p =>
        p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
      );
    }

    if (types.includes('suppliers')) {
      results.suppliers = this.data.suppliers.filter(s =>
        s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q)
      );
    }

    if (types.includes('orders')) {
      results.orders = this.data.orders.filter(o =>
        o.id.toLowerCase().includes(q) || o.item.toLowerCase().includes(q)
      );
    }

    return results;
  }

  // ═══ SETTINGS ═══
  saveSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }

  getSettings() {
    return this.data.settings;
  }
}

// Initialize the data store
const dataStore = new ABBProcurementDataStore();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ABBProcurementDataStore;
}
