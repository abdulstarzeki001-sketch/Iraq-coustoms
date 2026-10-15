window.App = window.App || {};

(function (App) {
  App.indexPage = {
    async init() {
      const page = App.dom.byId("companySearchGate");
      if (!page) return;

      const input = App.dom.byId("hashCompanySearch");
      const button = App.dom.byId("hashSearchBtn");
      const results = App.dom.byId("hashCompanyResults");
      const emptyState = App.dom.byId("companyEmptyState");
      const panel = App.dom.byId("companySelectedPanel");
      const selectedName = App.dom.byId("selectedCompanyName");
      const selectedDetails = App.dom.byId("selectedCompanyDetails");
      const continueBtn = App.dom.byId("continueToFormBtn");

      let selectedCompany = null;

      const syncContinueButton = () => {
        if (continueBtn) continueBtn.disabled = !selectedCompany;
      };

      const resetPortalState = () => {
        selectedCompany = null;
        App.storage.clearSelectedCompany();
        if (results) {
          results.innerHTML = "";
          results.style.display = "none";
        }
        if (panel) panel.style.display = "none";
        if (emptyState) emptyState.style.display = "flex";
        syncContinueButton();
      };

      const renderResults = (list) => {
        if (!results) return;

        if (!list.length) {
          results.innerHTML = '<div class="company-result-row"><span class="company-result-name">لا توجد نتائج مطابقة</span><span class="company-result-meta">جرّب رقم الشركة أو اسم الشركة أو رقم الإجازة أو العلامة التجارية.</span></div>';
          results.style.display = "block";
          if (emptyState) emptyState.style.display = "none";
          if (panel) panel.style.display = "none";
          return;
        }

        results.innerHTML = list.map((company) => {
          const normalized = App.companies.normalize(company);
          return `
            <div class="company-result-row" data-number="${App.utils.safeText(normalized.Number)}">
              <span class="company-result-code">رقم الشركة: ${App.utils.safeText(normalized.Number)}</span>
              <span class="company-result-name">${App.utils.safeText(normalized.CompanyNameProject)}</span>
              <span class="company-result-meta">الإجازة: ${App.utils.safeText(normalized.LicenseApprovalNumber)} — المحافظة: ${App.utils.safeText(normalized.GovernorateName)} — العلامة: ${App.utils.safeText(normalized.Brand)}</span>
            </div>
          `;
        }).join("");

        results.querySelectorAll(".company-result-row[data-number]").forEach((row) => {
          row.addEventListener("click", function () {
            selectedCompany = App.companies.findByNumber(this.dataset.number);
            if (!selectedCompany) return;

            App.storage.saveSelectedCompany(selectedCompany);

            if (selectedName) {
              selectedName.textContent = selectedCompany.CompanyNameProject || "الشركة";
            }

            if (selectedDetails) {
              selectedDetails.innerHTML = `
                <div><strong>رقم الشركة:</strong> ${App.utils.safeText(selectedCompany.Number)}</div>
                <div><strong>رقم الإجازة:</strong> ${App.utils.safeText(selectedCompany.LicenseApprovalNumber)}</div>
                <div><strong>المحافظة:</strong> ${App.utils.safeText(selectedCompany.GovernorateName)}</div>
                <div><strong>العلامة التجارية:</strong> ${App.utils.safeText(selectedCompany.Brand)}</div>
                <div><strong>الجهة المانحة:</strong> ${App.utils.safeText(selectedCompany.GrantingLicenseApproval)}</div>
                <div><strong>الوحدة:</strong> ${App.utils.safeText(selectedCompany.Unit)}</div>
              `;
            }

            if (panel) panel.style.display = "block";
            if (emptyState) emptyState.style.display = "none";
            results.style.display = "none";
            syncContinueButton();
          });
        });

        results.style.display = "block";
        if (emptyState) emptyState.style.display = "none";
      };

      const runSearch = async () => {
        const query = String(input?.value || "").trim();
        if (!query) {
          if (button) button.disabled = true;
          selectedCompany = null;
          resetPortalState();
          return;
        }

        selectedCompany = null;
        if (panel) panel.style.display = "none";
        syncContinueButton();

        await App.companies.load();
        renderResults(App.companies.search(query, 20));
      };

      if (input) {
        input.addEventListener("input", function () {
          const hasValue = Boolean(input.value.trim());
          if (button) button.disabled = !hasValue;
          if (!hasValue) {
            selectedCompany = null;
            resetPortalState();
            return;
          }

          if (panel) panel.style.display = "none";
          syncContinueButton();
        });

        input.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            runSearch();
          }
        });
      }

      if (button) {
        button.addEventListener("click", runSearch);
      }

      document.addEventListener("click", function (event) {
        if (!page.contains(event.target) && results) {
          results.style.display = "none";
        }
      });

      if (continueBtn) {
        continueBtn.addEventListener("click", function () {
          if (selectedCompany) App.storage.saveSelectedCompany(selectedCompany);
          window.location.href = "form.html";
        });
      }

      await App.companies.load();
      syncContinueButton();
      resetPortalState();
    }
  };
})(window.App);