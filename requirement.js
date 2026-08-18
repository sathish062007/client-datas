/* ==========================================================================
   Hasatz Solutions Client Portal - Requirement Form Handler (js/requirement.js)
   ========================================================================== */

class RequirementFormHandler {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.selectedFiles = [];

    this.init();
  }

  init() {
    this.form = document.getElementById('requirementForm');
    if (!this.form) return;

    this.bindStepWizard();
    this.bindFileUpload();
    this.bindFormSubmission();
    this.prefillUser();
  }

  // Pre-fill user data if logged in
  prefillUser() {
    const authObj = window.HasatzAuth || window.CodenexaAuth;
    const user = authObj ? authObj.getCurrentUser() : null;
    if (user) {
      const nameInput = document.getElementById('clientName');
      const emailInput = document.getElementById('clientEmail');
      if (nameInput && !nameInput.value) nameInput.value = user.displayName || '';
      if (emailInput && !emailInput.value) emailInput.value = user.email || '';
    }
  }

  // Wizard navigation setup
  bindStepWizard() {
    const nextBtns = document.querySelectorAll('.btn-next-step');
    const prevBtns = document.querySelectorAll('.btn-prev-step');

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.validateStep(this.currentStep)) {
          this.goToStep(this.currentStep + 1);
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
    });

    // Step indicator click
    const stepIndicators = document.querySelectorAll('.wizard-step');
    stepIndicators.forEach(ind => {
      ind.addEventListener('click', () => {
        const stepNum = parseInt(ind.dataset.step);
        if (stepNum < this.currentStep || this.validateStep(this.currentStep)) {
          this.goToStep(stepNum);
        }
      });
    });
  }

  // Validate step fields
  validateStep(step) {
    let isValid = true;
    const currentStepEl = document.getElementById(`step-${step}`);
    if (!currentStepEl) return true;

    const requiredFields = currentStepEl.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = '#f43f5e';
      } else {
        field.style.borderColor = '';
      }
    });

    if (!isValid) {
      window.showToast('Please complete all required fields before proceeding.', 'error');
    }
    return isValid;
  }

  // Navigate to target step
  goToStep(step) {
    if (step < 1 || step > this.totalSteps) return;

    this.currentStep = step;

    // Update Step Contents
    document.querySelectorAll('.form-step-content').forEach(el => {
      el.classList.remove('active');
    });
    const targetStepEl = document.getElementById(`step-${step}`);
    if (targetStepEl) targetStepEl.classList.add('active');

    // Update Step Header Indicators
    document.querySelectorAll('.wizard-step').forEach(ind => {
      const stepNum = parseInt(ind.dataset.step);
      ind.classList.remove('active', 'completed');
      if (stepNum === step) {
        ind.classList.add('active');
      } else if (stepNum < step) {
        ind.classList.add('completed');
      }
    });

    window.scrollTo({ top: 120, behavior: 'smooth' });
  }

  // File drag & drop file upload preview
  bindFileUpload() {
    const dropzone = document.getElementById('fileDropzone');
    const fileInput = document.getElementById('fileInput');
    const fileListEl = document.getElementById('fileList');

    if (!dropzone || !fileInput) return;

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        this.handleFiles(e.target.files);
      }
    });
  }

  handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!this.selectedFiles.some(f => f.name === file.name)) {
        this.selectedFiles.push(file);
      }
    });
    this.renderFileList();
  }

  renderFileList() {
    const fileListEl = document.getElementById('fileList');
    if (!fileListEl) return;

    fileListEl.innerHTML = '';
    this.selectedFiles.forEach((file, index) => {
      const chip = document.createElement('div');
      chip.className = 'file-chip';
      chip.innerHTML = `
        <span>📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
        <button type="button" class="file-chip-remove" data-index="${index}">&times;</button>
      `;
      fileListEl.appendChild(chip);
    });

    fileListEl.querySelectorAll('.file-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        this.selectedFiles.splice(idx, 1);
        this.renderFileList();
      });
    });
  }

  // Generate Unique Requirement ID
  generateRequirementId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    return `HSZ-${year}-${randomNum}`;
  }

  // Format WhatsApp Payload
  static formatWhatsAppMessage(req) {
    const pagesStr = req.pagesRequired.length > 0 ? req.pagesRequired.join(', ') : 'Default Setup';
    const featuresStr = req.featuresRequired.length > 0 ? req.featuresRequired.join(', ') : 'Standard Features';

    return `🚀 *NEW HASATZ SOLUTIONS CLIENT REQUIREMENT*

👤 *Client:* ${req.fullName}
🏢 *Business:* ${req.businessName}
📧 *Email:* ${req.email}
📱 *WhatsApp:* ${req.phone}

🌐 *Website:* ${req.websiteType}
📄 *Pages:* ${pagesStr}
⚙️ *Features:* ${featuresStr}

🎨 *Style:* ${req.websiteStyle || 'Modern'} (${req.preferredColor || 'Default'})
💰 *Budget:* ${req.budget || 'Flexible'}
📅 *Deadline:* ${req.completionDate || 'Flexible'}

📝 *Requirements:*
${req.websiteDescription}

🆔 *Requirement ID:* ${req.id}`;
  }

  // Form submission handler
  bindFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!this.validateStep(this.currentStep)) return;

      const reqId = this.generateRequirementId();

      // Collect Checked Pages
      const checkedPages = Array.from(
        document.querySelectorAll('input[name="pages"]:checked')
      ).map(cb => cb.value);

      // Collect Checked Features
      const checkedFeatures = Array.from(
        document.querySelectorAll('input[name="features"]:checked')
      ).map(cb => cb.value);

      // Construct Payload
      const requirementData = {
        id: reqId,
        fullName: document.getElementById('clientName').value.trim(),
        email: document.getElementById('clientEmail').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        businessName: document.getElementById('businessName').value.trim(),
        websiteType: document.getElementById('websiteType').value,
        projectName: document.getElementById('projectName').value.trim(),
        websiteDescription: document.getElementById('websiteDescription').value.trim(),
        targetAudience: document.getElementById('targetAudience').value.trim(),
        pagesRequired: checkedPages,
        featuresRequired: checkedFeatures,
        preferredColor: document.getElementById('preferredColor').value,
        websiteStyle: document.getElementById('websiteStyle').value,
        referenceUrl: document.getElementById('referenceUrl').value.trim(),
        budget: document.getElementById('budget').value,
        completionDate: document.getElementById('completionDate').value,
        additionalRequirements: document.getElementById('additionalRequirements').value.trim(),
        files: this.selectedFiles.map(f => f.name),
        status: 'Submitted',
        createdAt: new Date().toISOString()
      };

      // Store Requirement
      const storeObj = window.HasatzStore || window.CodenexaStore;
      storeObj.addRequirement(requirementData);

      window.showToast('Requirement Submitted Successfully!', 'success');

      // Redirect to success page with ID
      setTimeout(() => {
        window.location.href = `success.html?id=${encodeURIComponent(reqId)}`;
      }, 600);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new RequirementFormHandler();
});
