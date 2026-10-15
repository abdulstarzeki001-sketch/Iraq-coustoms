window.App = window.App || {};

(function (App) {
  App.tradersPage = {
    getElements() {
      return {
        page: App.dom.byId("tradersPage"),
        form: App.dom.byId("traderForm"),
        traderName: App.dom.byId("traderName"),
        traderFilter: App.dom.byId("traderFilter"),
        companyFilter: App.dom.byId("companyFilter"),
        tradersList: App.dom.byId("tradersAccountsList"),
        ledgerBody: App.dom.byId("traderLedgerBody"),
        ledgerEmpty: App.dom.byId("ledgerEmptyState"),
        totalEntries: App.dom.byId("ledgerTotalEntries"),
        totalDocs: App.dom.byId("ledgerTotalDocs"),
        totalPayments: App.dom.byId("ledgerTotalPayments"),
        remainingBalance: App.dom.byId("ledgerRemainingBalance"),
        summaryDocsValue: App.dom.byId("summaryDocsValue"),
        summaryPaymentsValue: App.dom.byId("summaryPaymentsValue"),
        summaryBalanceValue: App.dom.byId("summaryBalanceValue"),
        currentTraderTitle: App.dom.byId("currentTraderTitle"),
        currentTraderDesc: App.dom.byId("currentTraderDesc"),
        clearLedgerBtn: App.dom.byId("clearLedgerBtn"),
        paymentForm: App.dom.byId("paymentForm"),
        paymentTraderName: App.dom.byId("paymentTraderName"),
        paymentType: App.dom.byId("paymentType"),
        paymentAmount: App.dom.byId("paymentAmount"),
        paymentDate: App.dom.byId("paymentDate"),
        paymentReference: App.dom.byId("paymentReference"),
        paymentNotes: App.dom.byId("paymentNotes"),
        printLedgerBtn: App.dom.byId("printLedgerBtn"),
        printHeader: App.dom.byId("printHeader")
      };
    },

    formatUsd(value) {
      const number = Number(value || 0);
      if (!Number.isFinite(number)) return "0.00";
      return number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    normalizeAmount(value) {
      const normalized = App.utils.normalizeDigits(String(value ?? ""))
        .replace(/٫/g, ".")
        .replace(/,/g, ".")
        .trim();
      return Number(normalized);
    },

    getUniqueCompanies(entries) {
      const map = new Map();
      entries.forEach((entry) => {
        const name = String(entry.company_name_project ?? "").trim();
        const key = App.utils.normalizeSearchText(name);
        if (!name || map.has(key)) return;
        map.set(key, name);
      });
      return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "ar"));
    },

    getLedgerEntries() {
      return App.storage.getTraderLedger().map((entry) => {
        const amount = Number(entry.document_value_usd || 0);
        return {
          row_id: `doc_${entry.doc_id}_${App.utils.normalizeSearchText(entry.trader_name)}`,
          entry_type: "document",
          type_label: "وثيقة",
          date_value: String(entry.date_str || "").trim(),
          reference_value: String(entry.doc_id || "").trim(),
          trader_name: String(entry.trader_name || "").trim(),
          driver_name: String(entry.driver_name || "").trim(),
          destination_governorate: String(entry.destination_governorate || "").trim(),
          company_name_project: String(entry.company_name_project || "").trim(),
          debit: Number.isFinite(amount) ? amount : 0,
          credit: 0,
          created_at: String(entry.created_at || "")
        };
      });
    },

    getPaymentEntries() {
      return App.storage.getTraderPayments().map((entry) => {
        const amount = Number(entry.amount || 0);
        const type = String(entry.payment_type || "receipt").trim();
        const label = type === "settlement" ? "تسديد / تسوية" : "قبض من التاجر";
        return {
          row_id: String(entry.id || ""),
          entry_type: "payment",
          type_label: label,
          date_value: String(entry.payment_date || "").trim(),
          reference_value: String(entry.reference_no || "").trim() || "—",
          trader_name: String(entry.trader_name || "").trim(),
          driver_name: "—",
          destination_governorate: String(entry.notes || "").trim() || "—",
          company_name_project: "—",
          debit: 0,
          credit: Number.isFinite(amount) ? amount : 0,
          created_at: String(entry.created_at || "")
        };
      });
    },

    getCombinedEntries() {
      const entries = this.getLedgerEntries().concat(this.getPaymentEntries());

      return entries.sort((a, b) => {
        const aDate = `${a.date_value || ""} ${a.created_at || ""}`;
        const bDate = `${b.date_value || ""} ${b.created_at || ""}`;
        return bDate.localeCompare(aDate);
      });
    },

    renderCompanyFilter() {
      const { companyFilter } = this.getElements();
      if (!companyFilter) return;

      const companies = this.getUniqueCompanies(App.storage.getTraderLedger());
      const current = companyFilter.value;
      companyFilter.innerHTML = '<option value="">كل الشركات</option>' + companies.map((name) => {
        return `<option value="${App.utils.safeText(name)}">${App.utils.safeText(name)}</option>`;
      }).join("");

      if (companies.some((name) => name === current)) {
        companyFilter.value = current;
      }
    },

    calculateTraderCardSummary(traderName) {
      const traderKey = App.utils.normalizeSearchText(traderName);
      const documents = App.storage.getTraderLedger().filter((item) => {
        return App.utils.normalizeSearchText(item.trader_name) === traderKey;
      });
      const payments = App.storage.getTraderPayments().filter((item) => {
        return App.utils.normalizeSearchText(item.trader_name) === traderKey;
      });

      const docsTotal = documents.reduce((sum, item) => sum + Number(item.document_value_usd || 0), 0);
      const paymentsTotal = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      return {
        documentsCount: documents.length,
        docsTotal,
        paymentsTotal,
        balance: docsTotal - paymentsTotal
      };
    },

    renderTraders() {
      const { tradersList, traderFilter, paymentTraderName } = this.getElements();
      if (!tradersList) return;

      const traders = App.storage.getTraders();
      const currentFilter = traderFilter?.value || "";
      const currentPaymentTrader = paymentTraderName?.value || "";

      const options = traders.map((entry) => {
        return `<option value="${App.utils.safeText(entry.name)}">${App.utils.safeText(entry.name)}</option>`;
      }).join("");

      if (traderFilter) {
        traderFilter.innerHTML = '<option value="">كل التجار</option>' + options;
        if (traders.some((entry) => entry.name === currentFilter)) traderFilter.value = currentFilter;
      }

      if (paymentTraderName) {
        paymentTraderName.innerHTML = '<option value="">اختر التاجر</option>' + options;
        if (traders.some((entry) => entry.name === currentPaymentTrader)) paymentTraderName.value = currentPaymentTrader;
      }

      if (!traders.length) {
        tradersList.innerHTML = '<div class="trader-card empty">لا يوجد تجار محفوظون حتى الآن.</div>';
        return;
      }

      tradersList.innerHTML = traders.map((entry) => {
        const summary = this.calculateTraderCardSummary(entry.name);
        return `
          <div class="trader-card">
            <div>
              <div class="trader-card-name">${App.utils.safeText(entry.name)}</div>
              <div class="trader-card-meta">
                ${summary.documentsCount} وثيقة — وثائق ${this.formatUsd(summary.docsTotal)} $ — قبض/تسديد ${this.formatUsd(summary.paymentsTotal)} $ — متبقي ${this.formatUsd(summary.balance)} $
              </div>
            </div>
            <div class="trader-card-actions">
              <button type="button" class="mini-btn" data-filter-trader="${App.utils.safeText(entry.name)}">كشف الحساب</button>
              <button type="button" class="mini-btn success" data-payment-trader="${App.utils.safeText(entry.name)}">قبض / تسديد</button>
              <button type="button" class="mini-btn print" data-print-trader="${App.utils.safeText(entry.name)}">طباعة</button>
              <button type="button" class="mini-btn danger" data-delete-trader="${App.utils.safeText(entry.name)}">حذف</button>
            </div>
          </div>
        `;
      }).join("");

      tradersList.querySelectorAll("[data-filter-trader]").forEach((button) => {
        button.addEventListener("click", () => {
          if (traderFilter) traderFilter.value = button.dataset.filterTrader || "";
          this.renderLedger();
        });
      });

      tradersList.querySelectorAll("[data-payment-trader]").forEach((button) => {
        button.addEventListener("click", () => {
          const traderName = button.dataset.paymentTrader || "";
          if (paymentTraderName) paymentTraderName.value = traderName;
          const { paymentAmount } = this.getElements();
          paymentAmount?.focus();
          App.utils.showStatus(`تم تجهيز نموذج الحركة للتاجر: ${traderName}`, "info");
        });
      });

      tradersList.querySelectorAll("[data-print-trader]").forEach((button) => {
        button.addEventListener("click", () => {
          if (traderFilter) traderFilter.value = button.dataset.printTrader || "";
          this.renderLedger();
          this.printLedger();
        });
      });

      tradersList.querySelectorAll("[data-delete-trader]").forEach((button) => {
        button.addEventListener("click", () => {
          const traderName = button.dataset.deleteTrader || "";
          const confirmed = window.confirm(`سيتم حذف التاجر "${traderName}" مع كل وثائقه وحركاته المالية. هل أنت متأكد؟`);
          if (!confirmed) return;

          const deleted = App.storage.deleteTrader(traderName);
          if (!deleted) {
            App.utils.showStatus("تعذر حذف التاجر", "error");
            return;
          }

          this.refresh();
          App.utils.showStatus("تم حذف التاجر وكل بياناته", "info");
        });
      });
    },

    getFilteredEntries() {
      const { traderFilter, companyFilter } = this.getElements();
      const traderName = String(traderFilter?.value ?? "").trim();
      const companyName = String(companyFilter?.value ?? "").trim();

      return this.getCombinedEntries().filter((entry) => {
        const traderMatch = !traderName || App.utils.normalizeSearchText(entry.trader_name) === App.utils.normalizeSearchText(traderName);
        const companyMatch = !companyName || entry.entry_type !== "document" || App.utils.normalizeSearchText(entry.company_name_project) === App.utils.normalizeSearchText(companyName);
        return traderMatch && companyMatch;
      });
    },

    updateSummaryCard(entries) {
      const { traderFilter, companyFilter, currentTraderTitle, currentTraderDesc, summaryDocsValue, summaryPaymentsValue, summaryBalanceValue, printHeader } = this.getElements();
      const traderName = String(traderFilter?.value ?? "").trim();
      const companyName = String(companyFilter?.value ?? "").trim();

      const docsTotal = entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
      const paymentsTotal = entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);
      const balance = docsTotal - paymentsTotal;

      if (summaryDocsValue) summaryDocsValue.textContent = `${this.formatUsd(docsTotal)} $`;
      if (summaryPaymentsValue) summaryPaymentsValue.textContent = `${this.formatUsd(paymentsTotal)} $`;
      if (summaryBalanceValue) summaryBalanceValue.textContent = `${this.formatUsd(balance)} $`;

      if (currentTraderTitle) {
        currentTraderTitle.textContent = traderName ? `كشف حساب التاجر: ${traderName}` : "كشف عام لكل التجار";
      }

      const descParts = [];
      if (traderName) descParts.push(`التاجر المحدد: ${traderName}`);
      else descParts.push("الكشف الحالي يعرض جميع التجار");

      if (companyName) descParts.push(`تصفية الشركة: ${companyName}`);
      descParts.push(`إجمالي الوثائق ${this.formatUsd(docsTotal)} $`);
      descParts.push(`إجمالي الحركات الدائنة ${this.formatUsd(paymentsTotal)} $`);
      descParts.push(`الرصيد المتبقي ${this.formatUsd(balance)} $`);

      if (currentTraderDesc) currentTraderDesc.textContent = descParts.join(" — ");

      if (printHeader) {
        const today = new Date().toLocaleString("ar-IQ");
        printHeader.innerHTML = `
          <h1>${App.utils.safeText(currentTraderTitle?.textContent || "كشف الحساب")}</h1>
          <p>${App.utils.safeText(currentTraderDesc?.textContent || "")}</p>
          <p>تاريخ الطباعة: ${App.utils.safeText(today)}</p>
        `;
      }
    },

    renderLedger() {
      const { ledgerBody, ledgerEmpty, totalEntries, totalDocs, totalPayments, remainingBalance } = this.getElements();
      if (!ledgerBody || !ledgerEmpty) return;

      const entries = this.getFilteredEntries();
      let runningBalance = 0;

      const docsTotal = entries.reduce((sum, entry) => sum + Number(entry.debit || 0), 0);
      const paymentsTotal = entries.reduce((sum, entry) => sum + Number(entry.credit || 0), 0);
      const balance = docsTotal - paymentsTotal;

      if (totalEntries) totalEntries.textContent = String(entries.length);
      if (totalDocs) totalDocs.textContent = `${this.formatUsd(docsTotal)} $`;
      if (totalPayments) totalPayments.textContent = `${this.formatUsd(paymentsTotal)} $`;
      if (remainingBalance) remainingBalance.textContent = `${this.formatUsd(balance)} $`;

      this.updateSummaryCard(entries);

      if (!entries.length) {
        ledgerBody.innerHTML = "";
        ledgerEmpty.style.display = "block";
        return;
      }

      const orderedForStatement = [...entries].sort((a, b) => {
        const aDate = `${a.date_value || ""} ${a.created_at || ""}`;
        const bDate = `${b.date_value || ""} ${b.created_at || ""}`;
        return aDate.localeCompare(bDate);
      });

      ledgerBody.innerHTML = orderedForStatement.map((entry, index) => {
        runningBalance += Number(entry.debit || 0) - Number(entry.credit || 0);
        const canDelete = entry.entry_type === "payment";
        const actionButton = canDelete
          ? `<button type="button" class="mini-btn danger" data-delete-payment="${App.utils.safeText(entry.row_id)}">حذف الحركة</button>`
          : '<span>—</span>';

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${App.utils.safeText(entry.date_value || "—")}</td>
            <td><span class="row-type-badge ${entry.entry_type === "payment" ? "payment" : "document"}">${App.utils.safeText(entry.type_label)}</span></td>
            <td>${App.utils.safeText(entry.reference_value || "—")}</td>
            <td>${App.utils.safeText(entry.trader_name || "—")}</td>
            <td>${App.utils.safeText(entry.driver_name || "—")}</td>
            <td>${App.utils.safeText(entry.destination_governorate || "—")}</td>
            <td>${App.utils.safeText(entry.company_name_project || "—")}</td>
            <td class="amount-positive">${entry.debit ? `${this.formatUsd(entry.debit)} $` : "—"}</td>
            <td class="amount-negative">${entry.credit ? `${this.formatUsd(entry.credit)} $` : "—"}</td>
            <td class="balance-cell">${this.formatUsd(runningBalance)} $</td>
            <td class="screen-only">${actionButton}</td>
          </tr>
        `;
      }).join("");

      ledgerEmpty.style.display = "none";

      ledgerBody.querySelectorAll("[data-delete-payment]").forEach((button) => {
        button.addEventListener("click", () => {
          const paymentId = button.dataset.deletePayment || "";
          const confirmed = window.confirm("سيتم حذف حركة القبض/التسديد المحددة فقط. هل أنت متأكد؟");
          if (!confirmed) return;

          const deleted = App.storage.deleteTraderPayment(paymentId);
          if (!deleted) {
            App.utils.showStatus("تعذر حذف الحركة", "error");
            return;
          }

          this.refresh();
          App.utils.showStatus("تم حذف الحركة المالية", "info");
        });
      });
    },

    refresh() {
      this.renderCompanyFilter();
      this.renderTraders();
      this.renderLedger();
    },

    bindEvents() {
      const {
        form,
        traderName,
        traderFilter,
        companyFilter,
        clearLedgerBtn,
        paymentForm,
        paymentTraderName,
        paymentType,
        paymentAmount,
        paymentDate,
        paymentReference,
        paymentNotes,
        printLedgerBtn
      } = this.getElements();

      if (paymentDate && !paymentDate.value) {
        paymentDate.value = App.utils.formatDateInput(new Date());
      }

      if (form && traderName) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const name = traderName.value.trim();
          if (!name) {
            App.utils.showStatus("اكتب اسم التاجر أولاً", "error");
            traderName.focus();
            return;
          }

          const saved = App.storage.saveTrader(name);
          if (!saved) {
            App.utils.showStatus("تعذر حفظ اسم التاجر", "error");
            return;
          }

          traderName.value = "";
          this.refresh();
          App.utils.showStatus("تم حفظ التاجر بنجاح", "success");
        });
      }

      [traderFilter, companyFilter].forEach((field) => {
        if (!field) return;
        field.addEventListener("change", () => this.renderLedger());
      });

      if (paymentForm) {
        paymentForm.addEventListener("submit", (event) => {
          event.preventDefault();

          const trader_name = String(paymentTraderName?.value ?? "").trim();
          const payment_type = String(paymentType?.value ?? "receipt").trim();
          const amount = this.normalizeAmount(paymentAmount?.value ?? "");
          const payment_date = String(paymentDate?.value ?? "").trim();
          const reference_no = String(paymentReference?.value ?? "").trim();
          const notes = String(paymentNotes?.value ?? "").trim();

          if (!trader_name) {
            App.utils.showStatus("اختر التاجر أولاً", "error");
            paymentTraderName?.focus();
            return;
          }

          if (!Number.isFinite(amount) || amount <= 0) {
            App.utils.showStatus("أدخل مبلغًا صحيحًا أكبر من صفر", "error");
            paymentAmount?.focus();
            return;
          }

          if (!payment_date) {
            App.utils.showStatus("اختر تاريخ الحركة", "error");
            paymentDate?.focus();
            return;
          }

          const saved = App.storage.saveTraderPayment({
            trader_name,
            payment_type,
            amount,
            payment_date,
            reference_no,
            notes
          });

          if (!saved) {
            App.utils.showStatus("تعذر حفظ الحركة المالية", "error");
            return;
          }

          paymentAmount.value = "";
          paymentReference.value = "";
          paymentNotes.value = "";
          this.refresh();

          if (traderFilter) {
            traderFilter.value = trader_name;
            this.renderLedger();
          }

          App.utils.showStatus("تم تسجيل حركة القبض / التسديد بنجاح", "success");
        });
      }

      if (clearLedgerBtn) {
        clearLedgerBtn.addEventListener("click", () => {
          const traderNameValue = String(traderFilter?.value ?? "").trim();
          const companyNameValue = String(companyFilter?.value ?? "").trim();
          const hasFilters = Boolean(traderNameValue || companyNameValue);

          if (!hasFilters) {
            const confirmed = window.confirm("سيتم حذف كل قيود الوثائق وكل حركات القبض/التسديد لجميع التجار. هل أنت متأكد؟");
            if (!confirmed) return;

            localStorage.removeItem(App.constants.TRADER_LEDGER_KEY);
            localStorage.removeItem(App.constants.TRADER_PAYMENT_KEY);
            this.refresh();
            App.utils.showStatus("تم مسح كل كشف الحساب", "info");
            return;
          }

          const remainingDocs = App.storage.getTraderLedger().filter((entry) => {
            const traderMatch = !traderNameValue || App.utils.normalizeSearchText(entry.trader_name) === App.utils.normalizeSearchText(traderNameValue);
            const companyMatch = !companyNameValue || App.utils.normalizeSearchText(entry.company_name_project) === App.utils.normalizeSearchText(companyNameValue);
            return !(traderMatch && companyMatch);
          });

          // Payments have no company info — only filter by trader name.
          // If only a company filter is active (no trader), keep all payments.
          const remainingPayments = App.storage.getTraderPayments().filter((entry) => {
            if (!traderNameValue) return true;
            const traderMatch = App.utils.normalizeSearchText(entry.trader_name) === App.utils.normalizeSearchText(traderNameValue);
            return !traderMatch;
          });

          localStorage.setItem(App.constants.TRADER_LEDGER_KEY, JSON.stringify(remainingDocs));
          localStorage.setItem(App.constants.TRADER_PAYMENT_KEY, JSON.stringify(remainingPayments));
          this.refresh();
          App.utils.showStatus("تم مسح القيود المطابقة للتصفية الحالية", "info");
        });
      }

      if (printLedgerBtn) {
        printLedgerBtn.addEventListener("click", () => this.printLedger());
      }
    },

    printLedger() {
      this.renderLedger();
      window.print();
    },

    async init() {
      const { page } = this.getElements();
      if (!page) return;

      await App.companies.load();
      this.bindEvents();
      this.refresh();
    }
  };
})(window.App);