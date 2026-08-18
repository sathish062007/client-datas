/* ==========================================================================
   Codenexa Client Portal - Admin Management (js/admin.js)
   ========================================================================== */

class AdminDashboard {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    // Enforce Authorized Admin Access Guard
    if (typeof window.checkAdminAccess === 'function') {
      if (!window.checkAdminAccess()) return;
    }

    this.tableBody = document.getElementById('adminTableBody');
    this.cardContainer = document.getElementById('adminCardContainer');
    this.searchInput = document.getElementById('adminSearchInput');
    this.filterSelect = document.getElementById('adminStatusFilter');
    this.modal = document.getElementById('requirementDetailModal');

    if (!this.tableBody && !this.cardContainer) return;

    this.renderAdminInfo();
    this.bindEvents();
    this.render();
  }

  renderAdminInfo() {
    const adminTag = document.getElementById('adminUserBadge');
    if (adminTag) {
      adminTag.innerHTML = `🛡️ Logged in as Administrator`;
    }
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    if (this.filterSelect) {
      this.filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.render();
      });
    }

    // Modal Close
    const closeBtns = document.querySelectorAll('.modal-close, .btn-modal-close');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) this.closeModal();
      });
    }
  }

  getFilteredData() {
    const all = window.CodenexaStore.getRequirements();
    return all.filter(item => {
      // Status Filter
      if (this.currentFilter !== 'all' && item.status.toLowerCase() !== this.currentFilter.toLowerCase()) {
        return false;
      }
      // Search Filter
      if (this.searchQuery) {
        const text = `${item.id} ${item.fullName} ${item.businessName} ${item.projectName} ${item.websiteType}`.toLowerCase();
        return text.includes(this.searchQuery);
      }
      return true;
    });
  }

  updateStats(allRequirements) {
    const totalEl = document.getElementById('statTotal');
    const submittedEl = document.getElementById('statSubmitted');
    const reviewingEl = document.getElementById('statReviewing');
    const inProgressEl = document.getElementById('statInProgress');
    const completedEl = document.getElementById('statCompleted');

    if (!totalEl) return;

    const counts = {
      total: allRequirements.length,
      submitted: allRequirements.filter(r => r.status === 'Submitted').length,
      reviewing: allRequirements.filter(r => r.status === 'Reviewing').length,
      inProgress: allRequirements.filter(r => r.status === 'In Progress').length,
      completed: allRequirements.filter(r => r.status === 'Completed').length
    };

    if (totalEl) totalEl.textContent = counts.total;
    if (submittedEl) submittedEl.textContent = counts.submitted;
    if (reviewingEl) reviewingEl.textContent = counts.reviewing;
    if (inProgressEl) inProgressEl.textContent = counts.inProgress;
    if (completedEl) completedEl.textContent = counts.completed;
  }

  render() {
    const allData = window.CodenexaStore.getRequirements();
    const data = this.getFilteredData();

    this.updateStats(allData);

    // Render Table Body
    if (this.tableBody) {
      if (data.length === 0) {
        this.tableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
              🔍 No requirements found matching your criteria.
            </td>
          </tr>
        `;
      } else {
        this.tableBody.innerHTML = data.map(req => `
          <tr>
            <td>
              <strong style="color: var(--text-primary);">${req.id}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${window.formatDate(req.createdAt)}</div>
            </td>
            <td>
              <div style="font-weight: 700; color: var(--text-primary);">${req.fullName}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">${req.businessName}</div>
            </td>
            <td>
              <div style="font-size: 0.88rem; color: #059669; font-weight: 600;">📧 <a href="mailto:${req.email}">${req.email}</a></div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">📱 ${req.phone}</div>
            </td>
            <td>
              <div style="font-weight: 600; color: var(--text-primary);">${req.projectName}</div>
              <span class="pill-label" style="padding: 0.15rem 0.5rem; font-size: 0.75rem;">🌐 ${req.websiteType}</span>
            </td>
            <td><strong style="color: var(--primary-hover);">${req.budget || 'Flexible'}</strong></td>
            <td>
              <select class="form-control status-select" data-id="${req.id}" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; width: 140px;">
                <option value="Submitted" ${req.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
                <option value="Reviewing" ${req.status === 'Reviewing' ? 'selected' : ''}>Reviewing</option>
                <option value="In Progress" ${req.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${req.status === 'Completed' ? 'selected' : ''}>Completed</option>
              </select>
            </td>
            <td>
              <button class="btn btn-secondary btn-view-details" data-id="${req.id}" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;">
                View Details
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    this.bindRowActions();
  }

  bindRowActions() {
    // Status Change Listeners
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        window.CodenexaStore.updateRequirementStatus(id, newStatus);
        window.showToast(`Status updated to "${newStatus}"`, 'success');
        this.render();
      });
    });

    // View Details Listeners
    document.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.openModal(id);
      });
    });
  }

  openModal(id) {
    const req = window.CodenexaStore.getRequirementById(id);
    if (!req || !this.modal) return;

    const body = document.getElementById('modalDetailBody');
    if (!body) return;

    const pages = req.pagesRequired && req.pagesRequired.length ? req.pagesRequired.join(', ') : 'None specified';
    const features = req.featuresRequired && req.featuresRequired.length ? req.featuresRequired.join(', ') : 'None specified';
    const files = req.files && req.files.length ? req.files.map(f => `📄 ${f}`).join('<br>') : 'No attached files';

    body.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
        <div>
          <h3 style="font-size: 1.4rem; color: var(--text-primary);">${req.projectName}</h3>
          <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.2rem;">
            Requirement ID: <strong style="color: var(--primary);">${req.id}</strong> | Submitted: ${window.formatDate(req.createdAt)}
          </div>
        </div>
        <span class="badge badge-${req.status.toLowerCase().replace(' ', '')}">${req.status}</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Client Details</h4>
          <p><strong>Name:</strong> ${req.fullName}</p>
          <p><strong>Business:</strong> ${req.businessName}</p>
          <p><strong>Email:</strong> <a href="mailto:${req.email}">${req.email}</a></p>
          <p><strong>WhatsApp:</strong> ${req.phone}</p>
        </div>

        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Project Overview</h4>
          <p><strong>Type:</strong> ${req.websiteType}</p>
          <p><strong>Budget:</strong> ${req.budget || 'Flexible'}</p>
          <p><strong>Expected Date:</strong> ${req.completionDate || 'N/A'}</p>
          <p><strong>Target Audience:</strong> ${req.targetAudience || 'General'}</p>
        </div>
      </div>

      <div class="glass-card" style="padding: 1.25rem; margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Website Description</h4>
        <p style="white-space: pre-line;">${req.websiteDescription}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Pages Requested</h4>
          <p>${pages}</p>
        </div>

        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Features Requested</h4>
          <p>${features}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Design Preferences</h4>
          <p><strong>Color:</strong> <span style="display: inline-block; width: 14px; height: 14px; background: ${req.preferredColor}; border-radius: 50%; vertical-align: middle;"></span> ${req.preferredColor || 'Default'}</p>
          <p><strong>Style:</strong> ${req.websiteStyle || 'Modern'}</p>
          <p><strong>Reference URL:</strong> ${req.referenceUrl ? `<a href="${req.referenceUrl}" target="_blank">${req.referenceUrl}</a>` : 'None'}</p>
        </div>

        <div class="glass-card" style="padding: 1.25rem;">
          <h4 style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Uploaded Assets</h4>
          <p style="font-size: 0.9rem;">${files}</p>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
        <a href="https://www.instagram.com/hasatz_solutions?igsh=YTJra3RnbTBhNzlj" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="border-color: #e1306c; color: #e1306c;">
          📸 Instagram Profile
        </a>
        <a href="https://wa.me/${req.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ' + req.fullName + ', this is Hasatz Solutions regarding your website requirement ' + req.id)}" 
           target="_blank" class="btn btn-whatsapp">
          💬 Contact Client on WhatsApp
        </a>
        <button class="btn btn-secondary btn-modal-close">Close</button>
      </div>
    `;

    this.modal.classList.add('active');

    const modalCloseBtn = body.querySelector('.btn-modal-close');
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => this.closeModal());
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AdminDashboard();
});
