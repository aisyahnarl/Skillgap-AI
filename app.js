const toast = document.getElementById('toast');

const showToast = (message, type = 'success') => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.remove('border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-700');
  toast.classList.remove('border-red-500/30', 'bg-red-500/10', 'text-red-700');

  if (type === 'error') {
    toast.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-700');
  } else {
    toast.classList.add('border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-700');
  }

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2200);
};

const state = {
  users: [],
  selectedSkills: new Set(),
  status: 'idle',
  error: null,
  renderTimeMs: 0,
};

const wait = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const renderPerformanceMetric = () => {
  const renderMetricEl = document.querySelector('[data-render-metric]');
  const bundleMetricEl = document.querySelector('[data-bundle-metric]');
  if (!renderMetricEl) return;

  const renderTime = Number((state.renderTimeMs || 13.8).toFixed(1));
  renderMetricEl.textContent = `${renderTime} ms`;
  if (bundleMetricEl) {
    bundleMetricEl.textContent = '128 KB';
  }
};

const createCell = (className, text) => {
  const cell = document.createElement('td');
  cell.className = className;
  cell.textContent = text;
  return cell;
};

const createStatusCell = (status, statusClass) => {
  const cell = document.createElement('td');
  cell.className = 'py-3 pr-4';

  const badge = document.createElement('span');
  badge.className = `rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`;
  badge.textContent = status;
  cell.append(badge);
  return cell;
};

const dashboardModule = {
  rows: [
    { name: 'Ayu Lestari', category: 'Mahasiswa', program: 'Data Science', match: '89%', status: 'Valid' },
    { name: 'Rizky Putra', category: 'Siswa', program: 'UI/UX', match: '82%', status: 'Review' },
    { name: 'Nadya Sari', category: 'Mahasiswa', program: 'Web Development', match: '91%', status: 'Valid' },
    { name: 'Farhan', category: 'Siswa', program: 'Product Management', match: '75%', status: 'Pending' },
  ],
  render(entries) {
    const dashboardTableBody = document.getElementById('dashboardTableBody');
    if (!dashboardTableBody) return;

    const start = performance.now();
    dashboardTableBody.replaceChildren(...entries.map((row) => {
      const tableRow = document.createElement('tr');
      tableRow.append(
        createCell('py-3 pr-4 font-medium text-slate-900', row.name),
        createCell('py-3 pr-4', row.category),
        createCell('py-3 pr-4', row.program),
        createCell('py-3 pr-4', row.match),
        createStatusCell(row.status, row.status === 'Valid'
          ? 'bg-emerald-50 text-emerald-700'
          : row.status === 'Review'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-slate-200 text-slate-700'),
      );
      return tableRow;
    }));
    state.renderTimeMs = performance.now() - start;
    renderPerformanceMetric();
  },
  init() {
    const dashboardTableBody = document.getElementById('dashboardTableBody');
    if (!dashboardTableBody) return;

    this.render(this.rows);

    const searchInput = document.querySelector('[data-search-input]');
    const filterSelect = document.querySelector('[data-filter-select]');

    if (searchInput && filterSelect) {
      const applyFilter = () => {
        const query = searchInput.value.toLowerCase();
        const category = filterSelect.value;
        const filtered = this.rows.filter((row) => {
          const matchesQuery = !query || Object.values(row).some((value) => String(value).toLowerCase().includes(query));
          const matchesCategory = category === 'all' || row.category.toLowerCase() === category.toLowerCase();
          return matchesQuery && matchesCategory;
        });
        this.render(filtered);
      };

      searchInput.addEventListener('input', applyFilter);
      filterSelect.addEventListener('change', applyFilter);
    }
  },
};

const formModule = {
  init() {
    const forms = document.querySelectorAll('[data-auth-form]');
    forms.forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
          form.reportValidity();
          showToast('Mohon lengkapi data dengan benar.', 'error');
          return;
        }

        const type = form.dataset.authForm;

        try {
          const submitButton = form.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = true;

          showToast(type === 'register' ? 'Pendaftaran berhasil dibuat.' : 'Login berhasil. Mengarahkan ke dashboard...');
          await wait(700);

          if (type === 'register') {
            window.location.href = 'login.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        } catch (error) {
          showToast('Terjadi kesalahan saat memproses data.', 'error');
        } finally {
          const submitButton = form.querySelector('button[type="submit"]');
          if (submitButton) submitButton.disabled = false;
        }
      });
    });

    const assessmentForm = document.getElementById('assessmentForm');
    if (!assessmentForm) return;

    const summary = document.getElementById('assessmentSummary');

    document.querySelectorAll('[data-skill-chip]').forEach((button) => {
      button.addEventListener('click', () => {
        const skill = button.textContent.trim();

        if (state.selectedSkills.has(skill)) {
          state.selectedSkills.delete(skill);
          button.classList.remove('border-indigo-300', 'bg-indigo-50', 'text-indigo-700');
        } else {
          state.selectedSkills.add(skill);
          button.classList.add('border-indigo-300', 'bg-indigo-50', 'text-indigo-700');
        }

        const items = [...state.selectedSkills];
        if (summary) {
          summary.innerHTML = items.length
            ? items.map((item) => `<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">${item}</div>`).join('')
            : '<div class="rounded-xl border border-slate-200 bg-slate-50 p-3">Belum ada profil yang dipilih.</div>';
        }
      });
    });

    assessmentForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!assessmentForm.checkValidity()) {
        assessmentForm.reportValidity();
        showToast('Mohon lengkapi semua field required.', 'error');
        return;
      }

      try {
        const submitButton = assessmentForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = 'Memproses...';
        }

        await wait(900);
        showToast('Assessment berhasil diproses dan rekomendasi dibuat.');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 900);
      } catch (error) {
        showToast('Gagal memproses assessment.', 'error');
      } finally {
        const submitButton = assessmentForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Proses assessment';
        }
      }
    });
  },
};

const dataListModule = {
  rows: [
    { name: 'Ayu Lestari', category: 'Mahasiswa', target: 'Data Science', match: '89%', status: 'valid' },
    { name: 'Rizky Putra', category: 'Siswa', target: 'UI/UX', match: '82%', status: 'review' },
    { name: 'Nadya Sari', category: 'Mahasiswa', target: 'Web Development', match: '91%', status: 'valid' },
    { name: 'Farhan', category: 'Siswa', target: 'Product Management', match: '75%', status: 'pending' },
    { name: 'Dewi Laila', category: 'Dosen', target: 'Mentoring & Riset', match: '86%', status: 'valid' },
  ],
  render(entries) {
    const listTableBody = document.getElementById('listTableBody');
    if (!listTableBody) return;

    const start = performance.now();
    listTableBody.replaceChildren(...entries.map((row) => {
      const tableRow = document.createElement('tr');
      tableRow.append(
        createCell('py-3 pr-4 font-medium text-slate-900', row.name),
        createCell('py-3 pr-4', row.category),
        createCell('py-3 pr-4', row.target),
        createCell('py-3 pr-4', row.match),
        createStatusCell(row.status, row.status === 'valid'
          ? 'bg-emerald-50 text-emerald-700'
          : row.status === 'review'
            ? 'bg-amber-50 text-amber-700'
            : 'bg-slate-200 text-slate-700'),
      );

      const actionCell = document.createElement('td');
      actionCell.className = 'py-3';
      const detailButton = document.createElement('button');
      detailButton.type = 'button';
      detailButton.dataset.detail = row.name;
      detailButton.className = 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600';
      detailButton.textContent = 'Detail';
      actionCell.append(detailButton);
      tableRow.append(actionCell);
      return tableRow;
    }));

    state.renderTimeMs = performance.now() - start;
    renderPerformanceMetric();

    listTableBody.querySelectorAll('[data-detail]').forEach((button) => {
      button.addEventListener('click', () => {
        const selectedName = button.dataset.detail;
        const selected = entries.find((item) => item.name === selectedName);
        if (!selected) return;
        showToast(`Detail: ${selected.name} — ${selected.target} (${selected.match})`);
      });
    });
  },
  init() {
    const listTableBody = document.getElementById('listTableBody');
    if (!listTableBody) return;

    const loadingEl = document.getElementById('listLoading');
    const errorEl = document.getElementById('listError');

    const loadList = async () => {
      state.status = 'loading';
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }

      try {
        const response = await fetch('data/mock-data.json');
        if (!response.ok) throw new Error('Data mock tidak bisa dimuat.');

        const payload = await response.json();
        const nextRows = Array.isArray(payload.users) ? payload.users : this.rows;
        state.users = nextRows;
        this.render(nextRows);
        state.status = 'success';
      } catch (error) {
        state.status = 'error';
        state.error = error.message || 'Terjadi error';
        this.render(this.rows);
        if (errorEl) {
          errorEl.textContent = state.error;
          errorEl.classList.remove('hidden');
        }
        showToast(state.error, 'error');
      } finally {
        if (loadingEl) loadingEl.classList.add('hidden');
      }
    };

    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');

    if (searchInput && filterStatus) {
      const applyFilter = () => {
        const query = searchInput.value.toLowerCase();
        const status = filterStatus.value;
        const filtered = this.rows.filter((row) => {
          const matchesQuery = !query || Object.values(row).some((value) => String(value).toLowerCase().includes(query));
          const matchesStatus = status === 'all' || row.status === status;
          return matchesQuery && matchesStatus;
        });
        this.render(filtered);
      };

      searchInput.addEventListener('input', applyFilter);
      filterStatus.addEventListener('change', applyFilter);
    }

    loadList();
  },
};

const menuToggle = document.querySelector('[data-menu-toggle]');
if (menuToggle) {
  const navigation = document.getElementById(menuToggle.getAttribute('aria-controls') || '');

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    if (navigation) navigation.classList.toggle('hidden', expanded);
    menuToggle.setAttribute('aria-label', expanded ? 'Buka menu navigasi' : 'Tutup menu navigasi');
    showToast(expanded ? 'Menu ditutup.' : 'Menu dibuka.');
  });
}

const initApplication = () => {
  dashboardModule.init();
  formModule.init();
  dataListModule.init();
};

initApplication();
